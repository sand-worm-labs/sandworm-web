import { toolCallEvents } from '../mcp-chat-log.service';

const call = {
  toolName: 'add_cell',
  arguments: { notebookId: 'n1', type: 'python' },
  result: '{"cell":{"id":"c1"}}',
  isError: false,
  durationMs: 120,
  at: '2026-10-03T12:52:57.660Z',
  requestId: '7',
};

describe('toolCallEvents', () => {
  it('keeps the full call, and shows nothing for a call with no display', () => {
    expect(toolCallEvents(call)).toEqual([
      {
        type: 'mcp_tool_call',
        tool: 'add_cell',
        arguments: { notebookId: 'n1', type: 'python' },
        result: '{"cell":{"id":"c1"}}',
        is_error: false,
        duration_ms: 120,
        request_id: '7',
        at: '2026-10-03T12:52:57.660Z',
      },
    ]);
  });

  it('shows a plan as the thinking block the AI sidecar emits', () => {
    const [, start, delta, stop] = toolCallEvents({
      ...call,
      toolName: 'plan_notebook',
      display: [{ kind: 'thinking', text: 'Planning 1 block(s): python: Fear & Greed' }],
    });
    expect(start).toEqual({ type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } });
    expect(delta).toEqual({
      type: 'content_block_delta',
      index: 0,
      delta: { type: 'thinking_delta', thinking: 'Planning 1 block(s): python: Fear & Greed', duration_ms: 120 },
    });
    expect(stop).toEqual({ type: 'content_block_stop', index: 0 });
  });

  it('shows a cell change as a block action', () => {
    const [, delta] = toolCallEvents({
      ...call,
      display: [{ kind: 'block', action: 'created', blockId: 'c1', blockType: 'python', blockTitle: 'Fear & Greed' }],
    });
    expect(delta.delta).toEqual({
      type: 'block_action_delta',
      action: 'created',
      block_id: 'c1',
      block_type: 'python',
      block_title: 'Fear & Greed',
      executed_at: null,
    });
  });

  it('adds nothing to the assistant message for the prompt, which is the user\'s message', () => {
    expect(toolCallEvents({ ...call, display: [{ kind: 'prompt', text: 'make a notebook', afterWork: false }] })).toHaveLength(1);
  });

  it('shows text as a text delta', () => {
    const [, delta] = toolCallEvents({ ...call, display: [{ kind: 'text', text: 'Published: http://x' }] });
    expect(delta.delta).toEqual({ type: 'text_delta', text: 'Published: http://x\n\n' });
  });
});
