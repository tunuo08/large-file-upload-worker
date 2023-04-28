// upload-worker.js
self.addEventListener('message', async (event) => {
    const {type, data} = event.data;
    if (type === 'startWorkUploadFileSlice') {
        // url 是必填的 需要检验一下
        const {fileSlice, fileHash, url, headers = {}, params = {}} = data;
        try {
            const response = await uploadFileSlice(url, fileSlice, {fileHash, ...params}, headers);
            if (response.status === 200) {
                self.postMessage({fileHash, success: true});
            } else {
                self.postMessage({fileHash, success: false, error: response.statusText});
            }
        } catch (error) {
            self.postMessage({fileHash, success: false, error: error.message});
        }
    }
});

async function uploadFileSlice(url, fileSlice, params, headers) {
    const formData = new FormData();
    formData.append('file', fileSlice);

    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const workerHeaders = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
        workerHeaders.append(key, value);
    });

    const requestOptions = {
        method: 'POST',
        headers: workerHeaders,
        body: formData,
    };

    return await fetch(url, requestOptions);
}