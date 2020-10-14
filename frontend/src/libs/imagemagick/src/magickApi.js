"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * {@link call} shortcut that only returns the output files.
 */
async function Call(inputFiles, command) {
    const result = await call(inputFiles, command);
    return result.outputFiles;
}
exports.Call = Call;
/**
 * Low level execution function. All the other functions like [execute](https://github.com/KnicKnic/WASM-ImageMagick/tree/master/apidocs#execute)
 * ends up calling this one. It accept only one command and only in the form of array of strings.
 */
function call(inputFiles, command) {
    const request = {
        files: inputFiles,
        args: command,
        requestNumber: magickWorkerPromisesKey,
    };
    const promise = CreatePromiseEvent();
    magickWorkerPromises[magickWorkerPromisesKey] = promise;
    magickWorker.postMessage(request);
    magickWorkerPromisesKey++;
    return promise;
}
exports.call = call;
function CreatePromiseEvent() {
    let resolver;
    let rejecter;
    const emptyPromise = new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });
    emptyPromise.resolve = resolver;
    emptyPromise.reject = rejecter;
    return emptyPromise;
}
const magickWorker = new Worker('magick.js');
const magickWorkerPromises = {};
let magickWorkerPromisesKey = 1;
// handle responses as they stream in after being outputFiles by image magick
magickWorker.onmessage = e => {
    const response = e.data;
    const promise = magickWorkerPromises[response.requestNumber];
    delete magickWorkerPromises[response.requestNumber];
    const result = {
        outputFiles: response.outputFiles,
        stdout: response.stdout,
        stderr: response.stderr,
        exitCode: response.exitCode || 0,
    };
    promise.resolve(result);
};
//# sourceMappingURL=magickApi.js.map