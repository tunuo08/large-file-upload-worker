# FileUploader

`FileUploader`是一个高效、可扩展的文件上传库，允许分片上传大文件并计算文件哈希。它使用Web Workers进行并行处理，并提供了一个自定义worker脚本路径选项。

## 安装(未发布)

使用npm安装：

```bash
npm install --save file-uploader-package
```

或者使用yarn安装：

```bash
yarn add file-uploader-package
```

## 使用方法

1. 导入`FileUploader`：

```javascript
import FileUploader from 'file-uploader-package';
```

2. 创建`FileUploader`实例，并传入选项：

```javascript
const options = {
  workerPoolSize: 5,
  fileReaderPoolSize: 5,
  chunkSize: 1024 * 1024,
  workerScript: './custom-worker.js', // 可选，自定义worker脚本的相对路径
};

const fileUploader = new FileUploader(options);
```

3. 上传文件：

```javascript
fileUploader.upload(file);
```

4. 监听处理进度事件（可选）：

```javascript
fileUploader.addEventListener('hashProgress', (event) => {
  console.log('Hash progress:', event.detail);
});

fileUploader.addEventListener('uploadProgress', (event) => {
  console.log('Upload progress:', event.detail);
});
```

## 选项

`FileUploader`接受以下选项：

- `workerPoolSize` (Number, 默认值: 5): Web Workers池的大小。
- `fileReaderPoolSize` (Number, 默认值: 5): FileReader池的大小。
- `chunkSize` (Number, 默认值: 1024 * 1024): 文件切片的大小（以字节为单位）。
- `workerScript` (String, 可选): 自定义worker脚本的相对路径。

## 事件

`FileUploader`实例可以触发以下事件：

- `hashProgress`: 当文件哈希计算进度更新时触发。事件的`detail`属性包含一个对象，其中包含`progress`（百分比）、`processedSlices`（已处理的切片数）和`totalSlices`（总切片数）。
- `uploadProgress`: 当文件片段上传进度更新时触发。事件的`detail`属性包含一个对象，其中包含`index`（当前上传的片段索引）和`total`（总片段数）。

## 自定义worker脚本

您可以编写自定义的worker脚本来处理文件片段的上传。为了实现这个功能，您需要在自定义worker脚本中监听`message`事件，并在收到消息时执行文件片段的上传。一旦上传完成，您应该发送一个包含成功状态的消息。

这是一个自定义worker脚本的示例：

```javascript
self.addEventListener('message', async (event) => {
  const { task, fileSlice } = event.data;

  try {
    // 执行文件片段的上传
    // ...您的上传代码

    // 上传成功
    self.postMessage({ success: true });
  } catch (error) {
    // 上传失败
    self.postMessage({ success: false });
  }
});
```

然后在`FileUploader`的选项中指定自定义worker脚本的路径：

```javascript
import FileUploader from 'file-uploader-package';

const options = {
  workerPoolSize: 5,
  fileReaderPoolSize: 5,
  chunkSize: 1024 * 1024,
  workerScript: './path/to/your-custom-worker.js', // 自定义worker脚本的相对路径
};

const fileUploader = new FileUploader(options);
```

## 示例

以下是一个完整的`FileUploader`使用示例：

```javascript
import FileUploader from 'file-uploader-package';

const options = {
  workerPoolSize: 5,
  fileReaderPoolSize: 5,
  chunkSize: 1024 * 1024,
  workerScript: './path/to/your-custom-worker.js', // 可选，自定义worker脚本的相对路径
};

const fileUploader = new FileUploader(options);

fileUploader.addEventListener('hashProgress', (event) => {
  console.log('Hash progress:', event.detail);
});

fileUploader.addEventListener('uploadProgress', (event) => {
  console.log('Upload progress:', event.detail);
});

// 假设已经获取了一个文件对象（例如，从input元素中）
fileUploader.upload(file);
```

## 贡献

我们欢迎所有人为这个项目做出贡献。请在提交pull请求之前确保您的更改符合项目的代码风格和质量标准。

## 许可

`FileUploader`使用MIT许可。有关详细信息，请参阅[LICENSE](./LICENSE)文件。