self.addEventListener('message', async (event) => {
    const { type, data, apiUrl, headers } = event.data;

    if (type === 'uploadFileSlice') {
        const { fileSlice, sliceId } = data;

        try {
            const response = await uploadFileSlice(apiUrl, fileSlice, { sliceId }, headers);

            if (response.status === 200) {
                self.postMessage({ sliceId, success: true });
            } else {
                self.postMessage({ sliceId, success: false, error: response.statusText });
            }
        } catch (error) {
            self.postMessage({ sliceId, success: false, error: error.message });
        }
    }
});

async function uploadFileSlice(apiUrl, fileSlice, params, headersObj) {
    const formData = new FormData();
    formData.append('file', fileSlice);

    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const headers = new Headers();
    Object.entries(headersObj).forEach(([key, value]) => {
        headers.append(key, value);
    });

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: formData,
    };

    const response = await fetch(apiUrl, requestOptions);
    return response;
}