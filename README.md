# Large File Upload Worker

Large File Upload Worker 是一个用于处理大文件上传的 JavaScript 库。它使用 Web Workers 和 FileReader 进行文件的分片和并行上传，同时计算文件的 SHA-1 哈希值。计算哈希值使用了 [Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto)。

## 特性

- 使用 Web Workers 进行文件上传，不阻塞主线程。
- 使用 FileReader 读取文件，防止一次性读取大文件导致内存溢出。
- 计算文件的 SHA-1 哈希值，使用 [Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto)。
- 支持文件上传进度跟踪和错误处理。

## 安装

```bash
npm install large-file-upload-worker
```

## 使用

```javascript
import FileUploader from 'large-file-upload-worker';

const fileUploader = new FileUploader({
  workerPoolSize: 5,
  fileReaderPoolSize: 5,
  chunkSize: 1024 * 1024,
  workerScript: './upload-worker.js',
  algorithm: 'SHA-1',
});

fileUploader.upload(file, uploadConfig);
```

## API

### `new FileUploader(options)`

创建一个新的文件上传器实例。

参数:

- `options`: 配置对象。
    - `workerPoolSize`: Worker 池大小，默认为 5。
    - `fileReaderPoolSize`: FileReader 池大小，默认为 5。
    - `chunkSize`: 文件分片大小，默认为 1MB。
    - `workerScript`: Worker 脚本的路径，需要相对于使用者的环境，默认为 './upload-worker.js'。
    - `algorithm`: 用于计算文件哈希值的算法，默认为 'SHA-1',其他支持算法请查看 [Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto)。

### `fileUploader.upload(file, uploadConfig)`

上传一个文件。

参数:

- `file`: 要上传的文件对象。
- `uploadConfig`: 上传配置对象。
    - `url`: 上传的 URL。
    - `headers`: 上传请求的头部信息。
    - `params`: 上传请求的参数。
    - `workerScript`: Worker 脚本的路径，需要相对于使用者的环境，默认为 './upload-worker.js'。
    - `algorithm`: 用于计算文件哈希值的算法，默认为 'SHA-1'。
返回一个 Promise，解析为上传结果。


## 自定义事件

| 事件名称                 | 返回值                                          | 功能                                             |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| `hashProgress`           | `{ progress, processedSlices, totalSlices }`    | 在文件哈希计算过程中触发，返回当前进度信息       |
| `hashCompleteEvent`      | `{ hashHex }`                                   | 当文件哈希计算完成时触发                         |
| `uploadProgress`         | `{ fileHash, index, success, total }`           | 在文件上传过程中触发，返回当前上传的进度信息     |
| `uploadError`            | `{ fileHash, index, total, error }`             | 当文件上传出错时触发，返回错误信息               |
| `uploadComplete`         | `{ fileHash, total }`                           | 当文件上传完成时触发                             |

以上信息是根据具体代码实现进行调整的，如果有任何错误或遗漏，请随时告知。
## 开发和调试

运行以下命令启动开发服务器：

```bash
npm test
```

此命令将启动 browser-sync，你可以在浏览器中打开 `localhost:3000` 来查看和调试。

## 问题反馈

如果你在使用过程中遇到问题，欢迎通过 [GitHub Issues](https://github.com/tunuo08/large-file-upload-worker/issues) 提交问题。

## 许可证

此项目使用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎任何形式的贡献，包括提出问题、添加新功能、改进文档等。
