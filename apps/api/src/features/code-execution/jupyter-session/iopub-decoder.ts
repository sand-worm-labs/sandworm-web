import * as services from '@jupyterlab/services';
import { Logger } from "@nestjs/common"
import { isDisplayDataMessage, isErrorMessage, isExecuteResultMessage, isStatusMessage, isStreamMessage } from './helpers/jupyter'
import { Output } from '@sandworm/types';

// Plotly's notebook renderer announces itself, the first time a chart is shown
// in a session, with an HTML output that only loads plotly.js. The editor
// draws charts from their JSON, so that output would be megabytes of script
// stored in the document and shown as an empty frame. Kernel images set
// PLOTLY_RENDERER to avoid it; this covers the ones that do not. A figure
// exported with to_html() also configures Plotly but carries its graph div.
export function isPlotlyLoader(html: string): boolean {
    return html.includes('window.PlotlyConfig') && !html.includes('plotly-graph-div');
}

export function decodeIOPubMessage(
    message: services.KernelMessage.IIOPubMessage,
    onOutputs: (outputs: Output[]) => void
): void {
    const logger = new Logger('IOPubDecoder');
    if (isStatusMessage(message)) {
        const { execution_state } = message.content;
        if (execution_state !== 'idle' && execution_state !== 'busy') {
            logger.warn({ execution_state }, 'Unexpected execution_state');
        }
        return;
    }

    if (isStreamMessage(message)) {
        onOutputs([{
            type: 'stdio',
            name: message.content.name,
            text: message.content.text,
        }]);
        return;
    }

    if (isExecuteResultMessage(message) || isDisplayDataMessage(message)) {
        const data = message.content.data;

        const plotly = data['application/vnd.plotly.v1+json'] as any;
        if (plotly?.data) {
            onOutputs([{
                type: 'plotly',
                data: plotly.data,
                layout: plotly.layout,
                frames: plotly.frames,
            }]);
            return;
        }

        if (typeof data['image/png'] === 'string') {
            onOutputs([{ type: 'image', data: data['image/png'], format: 'png' }]);
            return;
        }

        if (typeof data['text/html'] === 'string') {
            if (isPlotlyLoader(data['text/html'])) {
                return;
            }
            onOutputs([{ type: 'html', html: data['text/html'] }]);
            return;
        }

        // IPython's Markdown() sends text/markdown plus a text/plain repr
        // ("<IPython.core.display.Markdown object>"), so this must come first.
        if (typeof data['text/markdown'] === 'string') {
            onOutputs([{ type: 'markdown', text: data['text/markdown'] }]);
            return;
        }

        if (typeof data['text/plain'] === 'string') {
            onOutputs([{ type: 'stdio', name: 'stdout', text: data['text/plain'] }]);
            return;
        }

        logger.warn({ mimeTypes: Object.keys(data) }, 'Unsupported display data');
        return;
    }

    if (isErrorMessage(message)) {
        onOutputs([{
            type: 'error',
            ename: message.content.ename,
            evalue: message.content.evalue,
            traceback: message.content.traceback ?? [],
        }]);
        return;
    }

    if (message.header.msg_type !== 'execute_input') {
        logger.warn({ msgType: message.header.msg_type }, 'Got unsupported message type');
    }
}