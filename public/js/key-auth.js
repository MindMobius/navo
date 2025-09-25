// 固定的私钥字符串
const SECRET_KEY = 'navo_secret_2025';

document.addEventListener('DOMContentLoaded', function() {
    updateKeyStatusIndicator();
    
    const keyAuthForm = document.getElementById('keyAuthForm');
    const string1Input = document.getElementById('string1');
    const string2Input = document.getElementById('string2');
    const currentKeySection = document.getElementById('currentKeySection');
    const currentKeyElement = document.getElementById('currentKey');
    const currentString1Element = document.getElementById('currentString1');
    const currentString2Element = document.getElementById('currentString2');
    const clearKeyBtn = document.getElementById('clearKeyBtn');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const copyString1Btn = document.getElementById('copyString1Btn');
    const copyString2Btn = document.getElementById('copyString2Btn');
    const keyHistoryGrid = document.getElementById('keyHistoryGrid');
    const guideSection = document.getElementById('guideSection');
    const keyAuthMain = document.getElementById('keyAuthMain');
    
    // 检查是否已存在密钥
    checkExistingKey();
    
    // 显示历史记录
    displayKeyHistory();
    
    // 表单提交事件
    if (keyAuthForm) {
        keyAuthForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateAndSaveKey();
        });
    }
    
    // 清除密钥事件
    if (clearKeyBtn) {
        clearKeyBtn.addEventListener('click', function() {
            if (confirm('确定要清除当前密钥吗？这将删除所有密钥记录。')) {
                localStorage.removeItem('navo_api_key');
                localStorage.removeItem('navo_key_history');
                currentKeySection.style.display = 'none';
                if (string1Input) string1Input.value = '';
                if (string2Input) string2Input.value = '';
                displayKeyHistory();
                // 显示引导界面
                if (guideSection) guideSection.style.display = 'block';
                updateKeyStatusIndicator();
            }
        });
    }
    
    // 复制密钥事件
    if (copyKeyBtn) {
        copyKeyBtn.addEventListener('click', function() {
            if (!currentKeyElement) return;
            
            const keyText = currentKeyElement.textContent;
            if (keyText) {
                navigator.clipboard.writeText(keyText).then(() => {
                    // 显示复制成功提示
                    const originalHTML = copyKeyBtn.innerHTML;
                    copyKeyBtn.innerHTML = '<i data-feather="check"></i>';
                    copyKeyBtn.classList.add('copied');
                    feather.replace();
                    
                    setTimeout(() => {
                        copyKeyBtn.innerHTML = originalHTML;
                        copyKeyBtn.classList.remove('copied');
                        feather.replace();
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                    alert('复制失败，请手动选择复制');
                });
            }
        });
    }
    
    // 复制na字符串事件
    if (copyString1Btn) {
        copyString1Btn.addEventListener('click', function() {
            if (!currentString1Element) return;
            
            const text = currentString1Element.textContent;
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    // 显示复制成功提示
                    const originalHTML = copyString1Btn.innerHTML;
                    copyString1Btn.innerHTML = '<i data-feather="check"></i>';
                    copyString1Btn.classList.add('copied');
                    feather.replace();
                    
                    setTimeout(() => {
                        copyString1Btn.innerHTML = originalHTML;
                        copyString1Btn.classList.remove('copied');
                        feather.replace();
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                    alert('复制失败，请手动选择复制');
                });
            }
        });
    }
    
    // 复制vo字符串事件
    if (copyString2Btn) {
        copyString2Btn.addEventListener('click', function() {
            if (!currentString2Element) return;
            
            const text = currentString2Element.textContent;
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    // 显示复制成功提示
                    const originalHTML = copyString2Btn.innerHTML;
                    copyString2Btn.innerHTML = '<i data-feather="check"></i>';
                    copyString2Btn.classList.add('copied');
                    feather.replace();
                    
                    setTimeout(() => {
                        copyString2Btn.innerHTML = originalHTML;
                        copyString2Btn.classList.remove('copied');
                        feather.replace();
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败', err);
                    alert('复制失败，请手动选择复制');
                });
            }
        });
    }
    
    function generateAndSaveKey() {
        if (!string1Input || !string2Input) return;
        
        const string1 = string1Input.value.trim();
        const string2 = string2Input.value.trim();
        
        if (!string1 || !string2) {
            alert('请输入两串字符');
            return;
        }
        
        // 使用固定私钥和用户输入生成固定长度的密钥
        const apiKey = generateFixedLengthKey(SECRET_KEY, string1, string2);
        
        // 保存到localStorage
        localStorage.setItem('navo_api_key', apiKey);
        
        // 添加到历史记录
        addToKeyHistory(string1, string2, apiKey);
        
        // 显示当前密钥
        displayCurrentKey(string1, string2, apiKey);
        
        // 更新历史记录显示
        displayKeyHistory();
        
        // 切换到历史记录标签页
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        if (tabBtns.length > 0 && tabPanes.length > 0) {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            const historyTabBtn = document.querySelector('.tab-btn[data-tab="history"]');
            if (historyTabBtn) historyTabBtn.classList.add('active');
            
            tabPanes.forEach(pane => pane.classList.remove('active'));
            const historyTab = document.getElementById('history-tab');
            if (historyTab) historyTab.classList.add('active');
        }
        
        // 隐藏引导界面
        if (guideSection) guideSection.style.display = 'none';
    }
    
    function checkExistingKey() {
        const apiKey = localStorage.getItem('navo_api_key');
        if (apiKey) {
            // 获取历史记录以找到对应的字符串
            const history = JSON.parse(localStorage.getItem('navo_key_history') || '[]');
            const currentEntry = history.find(entry => entry.apiKey === apiKey);
            
            if (currentEntry) {
                displayCurrentKey(currentEntry.string1, currentEntry.string2, apiKey);
            } else {
                displayCurrentKey('', '', apiKey);
            }
            
            // 隐藏引导界面
            if (guideSection) guideSection.style.display = 'none';
        } else {
            // 显示引导界面
            if (guideSection) guideSection.style.display = 'block';
        }
    }
    
    function displayCurrentKey(string1, string2, apiKey) {
        if (currentString1Element) currentString1Element.textContent = string1;
        if (currentString2Element) currentString2Element.textContent = string2;
        if (currentKeyElement) currentKeyElement.textContent = apiKey;
        if (currentKeySection) currentKeySection.style.display = 'block';
        
        // 重新初始化feather图标
        feather.replace();
    }
    
    // 移除了displayGuide函数，因为它现在通过HTML元素控制
    
    function addToKeyHistory(string1, string2, apiKey) {
        // 获取现有的历史记录
        let history = JSON.parse(localStorage.getItem('navo_key_history') || '[]');
        
        // 创建新的历史记录项
        const newEntry = {
            string1: string1,
            string2: string2,
            apiKey: apiKey,
            timestamp: new Date().toISOString()
        };
        
        // 检查是否已存在相同的记录
        const existingIndex = history.findIndex(entry => 
            entry.string1 === string1 && entry.string2 === string2);
        
        if (existingIndex >= 0) {
            // 如果已存在，将其移到最前面并更新时间戳
            history.splice(existingIndex, 1);
            history.unshift(newEntry);
        } else {
            // 如果不存在，添加到最前面
            history.unshift(newEntry);
        }
        
        // 保存更新后的历史记录
        localStorage.setItem('navo_key_history', JSON.stringify(history));
    }
    
    function displayKeyHistory() {
        // 确保元素存在
        if (!keyHistoryGrid) return;
        
        const history = JSON.parse(localStorage.getItem('navo_key_history') || '[]');
        const currentApiKey = localStorage.getItem('navo_api_key');
        
        // 清空现有内容
        keyHistoryGrid.innerHTML = '';
        
        if (history.length > 0) {
            // 添加历史记录项
            history.forEach((entry, index) => {
                const historyCard = document.createElement('div');
                historyCard.className = 'history-card';
                
                const isCurrentKey = currentApiKey === entry.apiKey;
                
                // 使用Mustache模板渲染历史记录卡片
                const template = document.getElementById('history-card-template').innerHTML;
                const templateData = {
                    index: index,
                    string1: entry.string1,
                    string2: entry.string2,
                    apiKey: entry.apiKey,
                    isCurrentKey: isCurrentKey
                };
                
                historyCard.innerHTML = Mustache.render(template, templateData);
                keyHistoryGrid.appendChild(historyCard);
            });
            
            // 重新初始化feather图标
            feather.replace();
            
            // 添加使用和删除按钮事件监听器
            document.querySelectorAll('.use-key-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const apiKey = this.getAttribute('data-key');
                    const string1 = this.getAttribute('data-string1');
                    const string2 = this.getAttribute('data-string2');
                    localStorage.setItem('navo_api_key', apiKey);
                    displayCurrentKey(string1, string2, apiKey);
                    // 重新显示历史记录以更新UI
                    displayKeyHistory();
                });
            });
            
            document.querySelectorAll('.delete-history-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    deleteHistoryEntry(index);
                });
            });
        }
    }
    
    function deleteHistoryEntry(index) {
        const history = JSON.parse(localStorage.getItem('navo_key_history') || '[]');
        
        // 检查要删除的是否是当前使用的密钥
        const entryToDelete = history[index];
        const currentApiKey = localStorage.getItem('navo_api_key');
        
        if (entryToDelete && entryToDelete.apiKey === currentApiKey) {
            alert('无法删除当前正在使用的密钥记录');
            return;
        }
        
        if (confirm('确定要删除这条密钥记录吗？')) {
            history.splice(index, 1);
            localStorage.setItem('navo_key_history', JSON.stringify(history));
            displayKeyHistory();
        }
    }
});


function updateKeyStatusIndicator() {
    const keyIndicator = document.getElementById('keyStatusIndicator');
    if (keyIndicator) {
        const hasKey = localStorage.getItem('navo_api_key');
        keyIndicator.classList.add(hasKey ? 'active' : 'inactive');
    }
}

// 生成固定长度密钥的函数，总长度为51个字符 (navo- + 46个小写字母)
function generateFixedLengthKey(secret, str1, str2) {
    // 组合所有输入
    const combined = secret + str1 + str2;
    
    // 使用cyrb53哈希算法
    function cyrb53(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
        h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
        return [h1>>>0, h2>>>0];
    }
    
    // 生成多个哈希值以获得更多字符
    const hashValues = [];
    hashValues.push(...cyrb53(combined, 0));
    hashValues.push(...cyrb53(combined, 1));
    hashValues.push(...cyrb53(combined, 2));
    
    // 将哈希值转换为字符
    let result = '';
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    
    // 使用哈希值生成46个字符
    for (let i = 0; i < 46; i++) {
        // 使用位运算和取模来选择字符
        const index = (hashValues[Math.floor(i / 16)] >> (i % 16)) & 31;
        result += chars[index % chars.length];
    }
    
    // 返回navo-前缀加生成的字符 (总长度51个字符)
    return 'navo-' + result;
}