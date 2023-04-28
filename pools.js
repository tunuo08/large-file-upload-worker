// 创建上传worker池 ,这个可以根据实际控制请求的并发量
export class UploadWorkerPool {
    #poolSize;
    #workers = [];
    #queue = [];
    #workerScript;

    constructor(poolSize, workerScript = "./upload-worker.js") {
        this.#poolSize = poolSize;
        this.#workerScript = workerScript;
    }

    // 上传文件
    async uploadFileSlice(uploadConfig, fileSlice, fileHash) {
        const {url, params, headers} = uploadConfig
        const worker = await this.#acquireWorker();
        return await new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                const {success, error} = event.data;
                this.#releaseWorker(worker);
                if (success) {
                    resolve({fileHash, success});
                } else {
                    reject({fileHash, success, error});
                }
            };
            worker.postMessage({
                type: 'startWorkUploadFileSlice',
                data: {
                    fileSlice, fileHash, params, url,
                    headers
                },
            }, [fileSlice]);
        });
    }

    // 获取worker
    async #acquireWorker() {
        if (this.#workers.length < this.#poolSize) {
            const worker = new Worker(this.workerScript);
            this.#workers.push(worker);
            return worker;
        } else {
            const workerPromise = new Promise((resolve) => {
                this.#queue.push(resolve);
            });
            return await workerPromise;
        }
    }

    // 调整 Worker 池大小
    #adjustWorkerPoolSize() {
        if (this.#queue.length > 0 && this.#workers.length < this.#poolSize) {
            // 需要更多的 Worker，创建一个新的 Worker
            const worker = new Worker(this.#workerScript);
            this.#workers.push(worker);
            const resolveNextWorker = this.#queue.shift();
            resolveNextWorker(worker);
        } else if (this.#queue.length === 0 && this.#workers.length > 1) {
            // 当前队列为空，销毁一个 Worker
            const workerToTerminate = this.#workers.pop();
            workerToTerminate.terminate();
        }
    }

    // 释放worker
    #releaseWorker(worker) {
        if (this.#queue.length > 0) {
            const resolveNextWorker = this.#queue.shift();
            resolveNextWorker(worker);
        } else {
            this.#workers = this.#workers.filter((w) => w !== worker);
            this.#adjustWorkerPoolSize(); // 根据队列大小调整 Worker 池大小
        }
    }
}

// FileReader实例池 防止一次读取多个文件造成溢出 (后期考虑根据内存大小扩展fileReader实例)
export class FileReaderPool {
    #poolSize;
    #readers = [];
    #queue = [];
    constructor(poolSize) {
        this.#poolSize = poolSize;
        this.#readers = [];
        this.#queue = [];
    }

    async readAsArrayBuffer(blob) {
        const reader = await this.acquireReader();
        return await new Promise((resolve, reject) => {
            reader.onload = () => {
                this.releaseReader(reader);
                resolve(reader.result);
            };
            reader.onerror = () => {
                this.releaseReader(reader);
                reject(reader.error);
            };
            reader.readAsArrayBuffer(blob);
        });
    }

    async acquireReader() {
        if (this.#readers.length < this.#poolSize) {
            const reader = new FileReader();
            this.#readers.push(reader);
            return reader;
        }
        const readerPromise = new Promise((resolve) => {
            this.#queue.push(resolve);
        });
        return await readerPromise;
    }


    releaseReader(reader) {
        if (this.#queue.length > 0) {
            const resolveNextReader = this.#queue.shift();
            resolveNextReader(reader);
        } else {
            this.#readers = this.#readers.filter((r) => r !== reader);
        }
    }
}