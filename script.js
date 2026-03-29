// 显示学号和姓名（已在 HTML 中写好，无需额外处理）

// 引入 TensorFlow.js 和 MobileNet 模型
import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js';
import { MobileNet } from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js';

// 获取 DOM 元素
const imageUpload = document.getElementById('imageUpload');
const classifyBtn = document.getElementById('classifyBtn');
const resultText = document.getElementById('resultText');
const previewImg = document.getElementById('preview');
const statusDiv = document.getElementById('status');

let model = null;

// 加载 MobileNet 模型
async function loadModel() {
    statusDiv.textContent = '正在加载 TensorFlow.js MobileNet 模型（约 5MB），请稍候...';
    try {
        // 等待 tf 和 MobileNet 初始化
        await tf.ready();
        model = await MobileNet.load();
        statusDiv.textContent = '模型加载完成，可以上传图片进行分类！';
        classifyBtn.disabled = false;
    } catch (err) {
        statusDiv.textContent = '模型加载失败，请刷新页面重试。错误：' + err.message;
        console.error(err);
        classifyBtn.disabled = true;
    }
}

// 将上传的图片转为 HTMLImageElement
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
    if (!model) {
        resultText.textContent = '模型尚未加载完成，请稍后再试。';
        return;
    }
    resultText.textContent = '正在分类，请稍候...';
    try {
        // 使用 MobileNet 进行分类，返回前 3 个预测结果
        const predictions = await model.classify(imageElement, 3);
        if (predictions.length === 0) {
            resultText.textContent = '未识别出明确类别';
            return;
        }
        const formatted = predictions.map(p => `${p.className}：${(p.probability * 100).toFixed(2)}%`).join('；');
        resultText.textContent = formatted;
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
