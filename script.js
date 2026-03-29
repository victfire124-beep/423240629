import { pipeline } from '@xenova/transformers';

// 显示学号和姓名（可以从 URL 参数或硬编码，这里直接写在 HTML 中，但也可以动态修改）
// 确保与 HTML 中一致，或者通过 JavaScript 读取，这里不做额外处理

// 获取 DOM 元素
const imageUpload = document.getElementById('imageUpload');
const classifyBtn = document.getElementById('classifyBtn');
const resultText = document.getElementById('resultText');
const previewImg = document.getElementById('preview');
const statusDiv = document.getElementById('status');

let classifier = null;

// 异步加载模型（首次加载可能稍慢）
async function loadModel() {
    statusDiv.textContent = '正在加载 AI 模型（MobileNet），首次加载需要下载约 20MB 文件，请稍候...';
    try {
        // 使用图像分类 pipeline，模型为 'Xenova/mobilenet-v2-1.0-224'
        classifier = await pipeline('image-classification', 'Xenova/mobilenet-v2-1.0-224');
        statusDiv.textContent = '模型加载完成，可以上传图片进行分类！';
        classifyBtn.disabled = false;
    } catch (err) {
        statusDiv.textContent = '模型加载失败，请刷新页面重试。错误：' + err.message;
        console.error(err);
        classifyBtn.disabled = true;
    }
}

// 将上传的图片转为 Image 对象
function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
            previewImg.src = e.target.result; // 预览
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 分类图片
async function classifyImage(imageElement) {
    if (!classifier) {
        resultText.textContent = '模型尚未加载完成，请稍后再试。';
        return;
    }
    resultText.textContent = '正在分类，请稍候...';
    try {
        // 直接传入图片元素或 URL，pipeline 会自动预处理
        const results = await classifier(imageElement);
        // 取前 3 个预测结果
        const topResults = results.slice(0, 3);
        const formatted = topResults.map(r => `${r.label}：${(r.score * 100).toFixed(2)}%`).join('；');
        resultText.textContent = formatted || '未识别出明确类别';
    } catch (err) {
        resultText.textContent = '分类出错：' + err.message;
        console.error(err);
    }
}

// 事件监听
classifyBtn.addEventListener('click', async () => {
    const file = imageUpload.files[0];
    if (!file) {
        resultText.textContent = '请先选择一张图片。';
        return;
    }
    try {
        const img = await loadImageFromFile(file);
        await classifyImage(img);
    } catch (err) {
        resultText.textContent = '图片加载失败，请重试。';
        console.error(err);
    }
});

// 页面加载时开始加载模型
loadModel();
