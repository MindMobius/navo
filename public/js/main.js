// 站点数据示例（实际项目中会从API获取）
const sampleSites = [
    {
        id: 1,
        url: "https://www.remove.bg",
        reviews: [
            {
                user: "张三",
                content: "一个非常好用的在线抠图工具，能快速移除图片背景，支持透明背景下载。"
            },
            {
                user: "李四",
                content: "处理效果很棒，特别是对于头发丝的处理很自然，比其他免费工具好用多了。这个工具真的帮我节省了很多时间。"
            }
        ],
        tags: ["图片处理", "设计", "AI工具"],
        createdAt: "2025-09-01"
    },
    {
        id: 2,
        url: "https://github.com",
        reviews: [
            {
                user: "王五",
                content: "全球最大的代码托管平台，支持Git版本控制，可以托管代码、管理项目。"
            }
        ],
        tags: ["开发", "代码托管"],
        createdAt: "2025-08-20"
    },
    {
        id: 3,
        url: "https://coolors.co",
        reviews: [
            {
                user: "赵六",
                content: "优秀的配色方案生成工具，可以快速生成和谐的配色方案，支持锁定颜色。"
            },
            {
                user: "钱七",
                content: "我每天都会用这个工具来寻找灵感，界面简洁，功能强大。"
            },
            {
                user: "孙八",
                content: "特别喜欢它的导出功能，可以导出多种格式，非常方便。"
            }
        ],
        tags: ["设计", "配色", "灵感"],
        createdAt: "2025-09-05"
    },
    {
        id: 4,
        url: "http://192.168.1.100:5000",
        reviews: [
            {
                user: "张三",
                content: "个人NAS管理面板，可以管理文件、下载任务、媒体服务等。"
            }
        ],
        tags: ["私有服务", "NAS"],
        createdAt: "2025-07-15"
    }
];

// 动态占位符文本
const placeholderTexts = [
    "搜索网址、用户名或关键词...",
    "试试搜索 '设计' 或 '开发'",
    "查找您需要的工具和资源",
    "输入网站名称或功能描述"
];

let placeholderIndex = 0;
let charIndex = 0;
let isDeleting = false;
let currentPlaceholder = "";
let placeholderTimer;

// 渲染站点卡片
function renderSites(sites) {
    const siteGrid = document.getElementById('siteGrid');
    siteGrid.innerHTML = '';
    
    sites.forEach(site => {
        const card = document.createElement('div');
        card.className = 'site-card';
        
        // 构建评价气泡HTML
        let reviewsHtml = '';
        site.reviews.forEach(review => {
            reviewsHtml += `
                <div class="review-bubble">
                    <div class="review-user">${review.user}</div>
                    <div class="review-content">${review.content}</div>
                </div>
            `;
        });
        
        // 构建标签HTML
        let tagsHtml = '';
        if (site.tags && site.tags.length > 0) {
            tagsHtml = `
                <div class="site-card-tags">
                    <div class="tag-list">
                        ${site.tags.map(tag => `<span class="tag-item">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="site-card-header">
                <a href="${site.url}" target="_blank" class="site-card-url">${site.url}</a>
            </div>
            <div class="site-card-body">
                ${reviewsHtml}
            </div>
            ${tagsHtml}
        `;
        siteGrid.appendChild(card);
    });
}

// 搜索功能
function searchSites(keyword) {
    if (!keyword) {
        return sampleSites;
    }
    
    return sampleSites.filter(site => 
        site.url.toLowerCase().includes(keyword.toLowerCase()) ||
        site.reviews.some(review => 
            review.content.toLowerCase().includes(keyword.toLowerCase()) ||
            review.user.toLowerCase().includes(keyword.toLowerCase())
        ) ||
        (site.tags && site.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
    );
}

// 登录模态框功能
function setupLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtns = document.querySelectorAll('.close');
    const loginForm = document.getElementById('loginForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // 打开登录模态框
    function openLoginModal() {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    }
    
    // 打开注册模态框
    function openRegisterModal() {
        registerModal.style.display = 'block';
        loginModal.style.display = 'none';
    }
    
    // 关闭所有模态框
    function closeAllModals() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
    
    // 绑定事件
    if (loginBtn) loginBtn.onclick = openLoginModal;
    if (switchToRegister) switchToRegister.onclick = function(e) {
        e.preventDefault();
        openRegisterModal();
    };
    if (switchToLogin) switchToLogin.onclick = function(e) {
        e.preventDefault();
        openLoginModal();
    };
    
    // 关闭模态框
    closeBtns.forEach(btn => {
        btn.onclick = closeAllModals;
    });
    
    // 点击模态框外部关闭
    window.onclick = function(event) {
        if (event.target == loginModal || event.target == registerModal) {
            closeAllModals();
        }
    };
    
    // 处理登录表单提交
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // 这里应该是实际的登录逻辑
            console.log('登录信息:', { email, password });
            
            // 模拟登录成功
            alert('登录成功！');
            closeAllModals();
            loginForm.reset();
        };
    }
    
    // 处理注册表单提交
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            // 简单验证
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致！');
                return;
            }
            
            // 这里应该是实际的注册逻辑
            console.log('注册信息:', { username, email, password });
            
            // 模拟注册成功
            alert('注册成功！');
            closeAllModals();
            registerForm.reset();
        };
    }
}

// 快捷搜索功能
function setupQuickSearch() {
    const quickLinks = document.querySelectorAll('.quick-links a');
    quickLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const keyword = this.getAttribute('data-search');
            document.getElementById('searchInput').value = keyword;
            const filteredSites = searchSites(keyword);
            renderSites(filteredSites);
        });
    });
}

// 动态占位符动画
function animatePlaceholder() {
    const placeholderElement = document.getElementById('dynamicPlaceholder');
    if (!placeholderElement) return;
    
    const currentText = placeholderTexts[placeholderIndex];
    
    if (isDeleting) {
        // 删除文字
        currentPlaceholder = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // 添加文字
        currentPlaceholder = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    placeholderElement.textContent = currentPlaceholder;
    
    // 判断是否需要切换到删除模式或下一个文本
    let typingSpeed = 150;
    
    if (!isDeleting && currentPlaceholder === currentText) {
        // 当前文本显示完毕，等待一段时间后开始删除
        typingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && currentPlaceholder === '') {
        // 当前文本删除完毕，切换到下一个文本
        isDeleting = false;
        placeholderIndex = (placeholderIndex + 1) % placeholderTexts.length;
        typingSpeed = 500;
    }
    
    placeholderTimer = setTimeout(animatePlaceholder, typingSpeed);
}

// 重置搜索功能
function setupResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (resetBtn && searchInput) {
        resetBtn.addEventListener('click', function() {
            searchInput.value = '';
            renderSites(sampleSites);
            searchInput.focus();
        });
    }
}

// 顶栏工具功能
function setupTopToolbar() {
    // 页面切换按钮
    const pageButtons = document.querySelectorAll('.page-slider-btn');
    pageButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            pageButtons.forEach(btn => btn.classList.remove('active'));
            // 为当前按钮添加active类
            this.classList.add('active');
            
            // 根据索引执行不同操作
            if (index === 1) {
                window.location.href = '/admin.html';
            }
        });
    });
    
    // 用户头像按钮和菜单
    const userAvatar = document.querySelector('.user-avatar');
    const userMenu = document.getElementById('userMenu');
    const loginMenuItem = document.getElementById('loginMenuItem');
    const registerMenuItem = document.getElementById('registerMenuItem');
    const profileMenuItem = document.getElementById('profileMenuItem');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    
    if (userAvatar && userMenu) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenu.classList.toggle('show');
        });
        
        // 点击页面其他地方关闭菜单
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target) && e.target !== userAvatar) {
                userMenu.classList.remove('show');
            }
        });
        
        // 登录菜单项
        if (loginMenuItem) {
            loginMenuItem.addEventListener('click', function() {
                document.getElementById('loginModal').style.display = 'block';
                userMenu.classList.remove('show');
            });
        }
        
        // 注册菜单项
        if (registerMenuItem) {
            registerMenuItem.addEventListener('click', function() {
                document.getElementById('registerModal').style.display = 'block';
                userMenu.classList.remove('show');
            });
        }
        
        // 个人资料菜单项
        if (profileMenuItem) {
            profileMenuItem.addEventListener('click', function() {
                window.location.href = '/user.html';
            });
        }
        
        // 退出登录菜单项
        if (logoutMenuItem) {
            logoutMenuItem.addEventListener('click', function() {
                // 模拟退出登录
                alert('已退出登录');
                userMenu.classList.remove('show');
            });
        }
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 渲染所有站点
    renderSites(sampleSites);
    
    // 设置登录模态框
    setupLoginModal();
    
    // 设置快捷搜索
    setupQuickSearch();
    
    // 设置重置按钮
    setupResetButton();
    
    // 设置顶栏工具
    setupTopToolbar();
    
    // 启动动态占位符动画
    animatePlaceholder();
    
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            const filteredSites = searchSites(keyword);
            renderSites(filteredSites);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                const filteredSites = searchSites(keyword);
                renderSites(filteredSites);
            }
        });
    }
});