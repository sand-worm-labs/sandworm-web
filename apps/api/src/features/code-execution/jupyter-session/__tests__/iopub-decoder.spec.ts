import { decodeIOPubMessage, isPlotlyLoader } from '../iopub-decoder';

const LOADER =
  '<script type="text/javascript">window.PlotlyConfig = {MathJaxConfig: \'local\'};</script><script type="text/javascript">/* plotly.js */</script>';

const displayData = (data: Record<string, unknown>) =>
  ({ header: { msg_type: 'display_data' }, content: { data, metadata: {} } }) as any;

describe('isPlotlyLoader', () => {
  it('recognizes the script-only output that loads plotly.js', () => {
    expect(isPlotlyLoader(LOADER)).toBe(true);
  });

  it('leaves a figure exported as HTML alone', () => {
    expect(isPlotlyLoader(`${LOADER}<div id="a1" class="plotly-graph-div"></div>`)).toBe(false);
  });

  it('leaves ordinary HTML alone', () => {
    expect(isPlotlyLoader('<table class="dataframe"></table>')).toBe(false);
  });
});

describe('decodeIOPubMessage', () => {
  it('drops the Plotly loader instead of storing it as an output', () => {
    const onOutputs = jest.fn();
    decodeIOPubMessage(displayData({ 'text/html': LOADER }), onOutputs);
    expect(onOutputs).not.toHaveBeenCalled();
  });

  it('keeps other HTML outputs', () => {
    const onOutputs = jest.fn();
    decodeIOPubMessage(displayData({ 'text/html': '<b>hi</b>' }), onOutputs);
    expect(onOutputs).toHaveBeenCalledWith([{ type: 'html', html: '<b>hi</b>' }]);
  });

  it('prefers the chart JSON when a display carries both', () => {
    const onOutputs = jest.fn();
    decodeIOPubMessage(
      displayData({ 'application/vnd.plotly.v1+json': { data: [{ type: 'bar' }], layout: {} }, 'text/html': '<div></div>' }),
      onOutputs,
    );
    expect(onOutputs).toHaveBeenCalledWith([{ type: 'plotly', data: [{ type: 'bar' }], layout: {}, frames: undefined }]);
  });
});
