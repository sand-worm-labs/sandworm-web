import * as services from '@jupyterlab/services';
import { Logger } from "@nestjs/common"
import { isDisplayDataMessage, isErrorMessage, isExecuteResultMessage, isStatusMessage, isStreamMessage } from './helpers/jupyter'
import { Output } from '@sandworm/types';

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
            onOutputs([{ type: 'html', html: data['text/html'] }]);
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