import {FileReaderPool, UploadWorkerPool} from './pools.js';

class FileUploader extends EventTarget {
    uploaderWorkerProcessors
    fileReaderPool
    chunkSize

    constructor(options) {
        super()
        const {workerPoolSize = 5, fileReaderPoolSize = 5, chunkSize = 1024 * 1024,workerScript} = options;
        this.chunkSize = chunkSize;
        this.uploaderWorkerProcessors = new UploadWorkerPool(workerPoolSize,workerScript);
        this.fileReaderPool = new FileReaderPool(fileReaderPoolSize);
    }

    async processFile(file) {
        return this.computeFileHash(file).then(hashObj => {
            const {hashHex, fileSliceArrayBuffers} = hashObj
            this.processAndUploadFile(hashHex, fileSliceArrayBuffers);
        });
    }

    processAndUploadFile(fileHash, fileSlices) {
        fileSlices.forEach((fileSlice, index) => {
            this.uploaderWorkerProcessors.uploadFileSlice({
                url: '',
                params: {sliceId: fileHash, index},
                headersObj: {}
            }, fileSlice).then(() => {
                const progressEvent = new CustomEvent('uploadProgress', {
                    detail: {
                        index,
                        total: fileSlices.length,
                    },
                });
                this.dispatchEvent(progressEvent);
            });
        });
    }

    // 计算文件的 SHA-1 值并将其分片
    async computeFileHash(file) {
        console.time('computeFileHash');
        let blockSize = this.chunkSize;
        // 将文件切成多个片段
        const fileSlices = sliceFile(file, blockSize);
        const fileSliceArrayBuffers = [];
        const totalSlices = fileSlices.length;
        let processedSlices = 0;

        // 使用 FileReader 实例池逐个读取文件片段，并计算整个文件的 SHA-1
        const hash = new Hash(); // 使用 SubtleCrypto 对象进行 SHA-1 运算

        for (const fileSlice of fileSlices) {
            const arrayBuffer = await this.fileReaderPool.readAsArrayBuffer(fileSlice);
            await hash.update(arrayBuffer);
            processedSlices++;

            // 计算并打印进度 // todo 这个需要优化 通过事件传递
            const progress = (processedSlices / totalSlices) * 100;
            const progressEvent = new CustomEvent('hashProgress', {
                detail: {
                    progress,
                    processedSlices,
                    totalSlices,
                },
            });
            this.dispatchEvent(progressEvent);
        }

        const hashHex = await hash.digestToHex();
        console.timeEnd('computeFileHash');
        console.log('fileHash', hashHex);
        return {hashHex, fileSliceArrayBuffers};
    }

    upload(file) {
        this.processFile(file);
    }
}

class Hash {
    constructor(algorithm = 'SHA-1') {
        this.crypto = window.crypto || window.msCrypto;
        this.algorithm = algorithm;
        this.subtle = this.crypto.subtle || this.crypto.webkitSubtle;
        this.chunks = [];
    }

    // 更新哈希值
    async update(chunk) {
        this.chunks.push(chunk);
    }

    // 返回哈希值的 ArrayBuffer
    async digest() {
        if (this.chunks.length === 0) {
            return null;
        }

        let hashBuffer = null;
        for (const chunk of this.chunks) {
            if (!hashBuffer) {
                hashBuffer = chunk;
            } else {
                hashBuffer = await this.concatArrayBuffers(hashBuffer, chunk);
            }
            hashBuffer = await this.subtle.digest(this.algorithm, hashBuffer);
        }
        return hashBuffer;
    }

    // 返回哈希值的十六进制字符串
    async digestToHex() {
        const digest = await this.digest();
        const hashArray = Array.from(new Uint8Array(digest));
        const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // 连接两个 ArrayBuffer
    async concatArrayBuffers(buffer1, buffer2) {
        const result = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        result.set(new Uint8Array(buffer1), 0);
        result.set(new Uint8Array(buffer2), buffer1.byteLength);
        return result.buffer;
    }
}


function sliceFile(file, chunkSize) {
    let blobSlice=File.prototype.slice||File.prototype.mozSlice||File.prototype.webkitSlice;
    const fileSize=file.size;
    let offset=0;
    const chunks=[];
    while(offset<fileSize){
        const chunk=blobSlice.call(file,offset,offset+chunkSize);
        chunks.push(chunk);
        offset+=chunkSize;
    }
    return chunks;
}

export default FileUploader;