import { KernelMessage } from '@jupyterlab/services';

export function isStreamMessage(
    msg: KernelMessage.IIOPubMessage
): msg is KernelMessage.IStreamMsg {
    return msg.header.msg_type === 'stream';
}

export function isStatusMessage(
    msg: KernelMessage.IIOPubMessage
): msg is KernelMessage.IStatusMsg {
    return msg.header.msg_type === 'status';
}

export function isExecuteResultMessage(
    msg: KernelMessage.IIOPubMessage
): msg is KernelMessage.IExecuteResultMsg {
    return msg.header.msg_type === 'execute_result';
}

export function isDisplayDataMessage(
    msg: KernelMessage.IIOPubMessage
): msg is KernelMessage.IDisplayDataMsg {
    return msg.header.msg_type === 'display_data';
}

export function isErrorMessage(
    msg: KernelMessage.IIOPubMessage
): msg is KernelMessage.IErrorMsg {
    return msg.header.msg_type === 'error';
}
