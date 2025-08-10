const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { chromium } = require('playwright');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('static'));
app.use(express.json());

// Enhanced user agents with realistic browser fingerprints from different countries
const userAgents = [
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'en-US', 
        region: 'United States',
        timezone: 'America/New_York',
        platform: 'Win32',
        currency: 'USD',
        language: 'en-US,en;q=0.9',
        flag: '🇺🇸'
    },
    { 
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 
        locale: 'en-GB', 
        region: 'United Kingdom',
        timezone: 'Europe/London',
        platform: 'MacIntel',
        currency: 'GBP',
        language: 'en-GB,en;q=0.9',
        flag: '🇬🇧'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0', 
        locale: 'fr-FR', 
        region: 'France',
        timezone: 'Europe/Paris',
        platform: 'Win32',
        currency: 'EUR',
        language: 'fr-FR,fr;q=0.9,en;q=0.8',
        flag: '🇫🇷'
    },
    { 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 
        locale: 'ja-JP', 
        region: 'Japan',
        timezone: 'Asia/Tokyo',
        platform: 'iPhone',
        currency: 'JPY',
        language: 'ja-JP,ja;q=0.9,en;q=0.8',
        flag: '🇯🇵'
    },
    { 
        ua: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 
        locale: 'de-DE', 
        region: 'Germany',
        timezone: 'Europe/Berlin',
        platform: 'Linux armv81',
        currency: 'EUR',
        language: 'de-DE,de;q=0.9,en;q=0.8',
        flag: '🇩🇪'
    },
    { 
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', 
        locale: 'es-ES', 
        region: 'Spain',
        timezone: 'Europe/Madrid',
        platform: 'MacIntel',
        currency: 'EUR',
        language: 'es-ES,es;q=0.9,en;q=0.8',
        flag: '🇪🇸'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0', 
        locale: 'en-AU', 
        region: 'Australia',
        timezone: 'Australia/Sydney',
        platform: 'Win32',
        currency: 'AUD',
        language: 'en-AU,en;q=0.9',
        flag: '🇦🇺'
    },
    { 
        ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'pt-BR', 
        region: 'Brazil',
        timezone: 'America/Sao_Paulo',
        platform: 'Linux x86_64',
        currency: 'BRL',
        language: 'pt-BR,pt;q=0.9,en;q=0.8',
        flag: '🇧🇷'
    },
    { 
        ua: 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 
        locale: 'zh-CN', 
        region: 'China',
        timezone: 'Asia/Shanghai',
        platform: 'iPad',
        currency: 'CNY',
        language: 'zh-CN,zh;q=0.9,en;q=0.8',
        flag: '🇨🇳'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'it-IT', 
        region: 'Italy',
        timezone: 'Europe/Rome',
        platform: 'Win32',
        currency: 'EUR',
        language: 'it-IT,it;q=0.9,en;q=0.8',
        flag: '🇮🇹'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'ru-RU', 
        region: 'Russia',
        timezone: 'Europe/Moscow',
        platform: 'Win32',
        currency: 'RUB',
        language: 'ru-RU,ru;q=0.9,en;q=0.8',
        flag: '🇷🇺'
    },
    { 
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'ko-KR', 
        region: 'South Korea',
        timezone: 'Asia/Seoul',
        platform: 'MacIntel',
        currency: 'KRW',
        language: 'ko-KR,ko;q=0.9,en;q=0.8',
        flag: '🇰🇷'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'hi-IN', 
        region: 'India',
        timezone: 'Asia/Kolkata',
        platform: 'Win32',
        currency: 'INR',
        language: 'hi-IN,hi;q=0.9,en;q=0.8',
        flag: '🇮🇳'
    },
    { 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 
        locale: 'ar-SA', 
        region: 'Saudi Arabia',
        timezone: 'Asia/Riyadh',
        platform: 'iPhone',
        currency: 'SAR',
        language: 'ar-SA,ar;q=0.9,en;q=0.8',
        flag: '🇸🇦'
    },
    { 
        ua: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 
        locale: 'nl-NL', 
        region: 'Netherlands',
        timezone: 'Europe/Amsterdam',
        platform: 'Linux armv81',
        currency: 'EUR',
        language: 'nl-NL,nl;q=0.9,en;q=0.8',
        flag: '🇳🇱'
    }
];

function normalizeYouTubeUrl(inputUrl) {
    let url = inputUrl.trim();
    
    // Handle various YouTube URL formats including shorts
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    if (url.includes('youtube.com/shorts/')) {
        const videoId = url.split('shorts/')[1].split('?')[0];
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    if (url.includes('youtube.com/watch')) {
        return url.split('&')[0]; // Remove extra parameters
    }
    
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }
    
    return url;
}

async function simulateAdvancedHumanBehavior(page, socketId, viewIndex, userAgent) {
    try {
        const viewport = await page.viewportSize();
        
        // Advanced mouse movement patterns (curved paths)
        for (let i = 0; i < Math.floor(Math.random() * 8 + 5); i++) {
            const startX = Math.floor(Math.random() * viewport.width * 0.8 + viewport.width * 0.1);
            const startY = Math.floor(Math.random() * viewport.height * 0.8 + viewport.height * 0.1);
            const endX = Math.floor(Math.random() * viewport.width * 0.8 + viewport.width * 0.1);
            const endY = Math.floor(Math.random() * viewport.height * 0.8 + viewport.height * 0.1);
            
            // Create curved path
            const steps = Math.floor(Math.random() * 30 + 20);
            for (let step = 0; step <= steps; step++) {
                const progress = step / steps;
                const curveX = startX + (endX - startX) * progress + Math.sin(progress * Math.PI) * 50;
                const curveY = startY + (endY - startY) * progress + Math.cos(progress * Math.PI) * 30;
                
                await page.mouse.move(curveX, curveY);
                await page.waitForTimeout(Math.floor(Math.random() * 50 + 10));
            }
        }
        
        // Realistic scrolling with momentum
        const scrollActions = Math.floor(Math.random() * 6 + 3);
        for (let i = 0; i < scrollActions; i++) {
            const scrollDistance = Math.floor(Math.random() * 400 + 150);
            const direction = Math.random() > 0.8 ? -1 : 1; // Mostly scroll down
            
            // Simulate momentum scrolling
            for (let momentum = 0; momentum < 5; momentum++) {
                const currentScroll = scrollDistance * (1 - momentum * 0.2);
                await page.evaluate(`window.scrollBy(0, ${currentScroll * direction})`);
                await page.waitForTimeout(Math.floor(Math.random() * 200 + 100));
            }
            
            await page.waitForTimeout(Math.floor(Math.random() * 2000 + 1000));
        }
        
        // Advanced engagement behaviors
        if (Math.random() < 0.6) {
            // Simulate reading comments
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight * 0.4)');
            await page.waitForTimeout(Math.floor(Math.random() * 4000 + 3000));
            console.log(`${userAgent.flag} Simulated reading comments for view ${viewIndex} from ${userAgent.region}`);
            io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Simulated reading comments for view ${viewIndex} from ${userAgent.region}` });
        }
        
        // Simulate video interaction behaviors
        if (Math.random() < 0.4) {
            try {
                // Click on video to focus
                const video = await page.$('video');
                if (video) {
                    await video.click();
                    await page.waitForTimeout(500);
                }
            } catch (e) {}
        }
        
        // Keyboard interactions (volume, pause/play)
        if (Math.random() < 0.3) {
            const actions = ['ArrowUp', 'ArrowDown', 'Space', 'KeyM'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            try {
                await page.keyboard.press(action);
                await page.waitForTimeout(Math.floor(Math.random() * 1000 + 500));
                console.log(`${userAgent.flag} Keyboard interaction (${action}) for view ${viewIndex} from ${userAgent.region}`);
                io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Keyboard interaction (${action}) for view ${viewIndex} from ${userAgent.region}` });
            } catch (e) {}
        }
        
        // Random pauses (like real users thinking)
        if (Math.random() < 0.4) {
            const pauseTime = Math.floor(Math.random() * 6000 + 3000);
            await page.waitForTimeout(pauseTime);
            console.log(`${userAgent.flag} Thinking pause of ${pauseTime/1000}s for view ${viewIndex} from ${userAgent.region}`);
            io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Thinking pause of ${pauseTime/1000}s for view ${viewIndex} from ${userAgent.region}` });
        }
        
        // Simulate checking video description
        if (Math.random() < 0.3) {
            try {
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight * 0.2)');
                await page.waitForTimeout(Math.floor(Math.random() * 3000 + 2000));
                console.log(`${userAgent.flag} Checked video description for view ${viewIndex} from ${userAgent.region}`);
                io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Checked video description for view ${viewIndex} from ${userAgent.region}` });
            } catch (e) {}
        }
        
        // Simulate tab switching behavior
        if (Math.random() < 0.2) {
            await page.keyboard.press('Alt+Tab');
            await page.waitForTimeout(Math.floor(Math.random() * 2000 + 1000));
            await page.keyboard.press('Alt+Tab');
            console.log(`${userAgent.flag} Simulated tab switching for view ${viewIndex} from ${userAgent.region}`);
            io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Simulated tab switching for view ${viewIndex} from ${userAgent.region}` });
        }
        
    } catch (e) {
        console.log(`Error in advanced human behavior simulation for view ${viewIndex}: ${e}`);
    }
}

async function processView(url, viewIndex, totalViews, socketId, browser) {
    let context, page;
    try {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const isMobile = userAgent.ua.includes('Mobile') || userAgent.ua.includes('iPhone') || userAgent.ua.includes('Android') || userAgent.ua.includes('iPad');
        
        // More realistic viewport sizes based on actual device statistics
        const viewport = {
            width: isMobile ? 
                Math.floor(Math.random() * (428 - 360 + 1)) + 360 : 
                Math.floor(Math.random() * (2560 - 1024 + 1)) + 1024,
            height: isMobile ? 
                Math.floor(Math.random() * (926 - 640 + 1)) + 640 : 
                Math.floor(Math.random() * (1440 - 768 + 1)) + 768
        };

        context = await browser.newContext({
            userAgent: userAgent.ua,
            viewport,
            deviceScaleFactor: Math.random() * 2 + 1,
            isMobile,
            hasTouch: isMobile,
            locale: userAgent.locale,
            timezoneId: userAgent.timezone,
            javaScriptEnabled: true,
            bypassCSP: true,
            extraHTTPHeaders: {
                'Accept-Language': userAgent.language,
                'DNT': Math.random() > 0.5 ? '1' : '0',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Dest': 'document',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': Math.random() > 0.5 ? 'no-cache' : 'max-age=0',
                'Pragma': 'no-cache',
                'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-CH-UA-Mobile': isMobile ? '?1' : '?0',
                'Sec-CH-UA-Platform': `"${userAgent.platform}"`,
                'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            }
        });

        console.log(`${userAgent.flag} Context created for view ${viewIndex}/${totalViews} from ${userAgent.region}`);
        io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Context created for view ${viewIndex}/${totalViews} from ${userAgent.region}` });

        // Enhanced browser fingerprint spoofing
        await context.addInitScript(`
            // Remove all webdriver traces
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            delete navigator.__proto__.webdriver;
            delete window.navigator.__proto__.webdriver;
            delete Object.getPrototypeOf(navigator).webdriver;
            
            // Enhanced platform spoofing
            Object.defineProperty(navigator, 'platform', { get: () => '${userAgent.platform}' });
            Object.defineProperty(navigator, 'oscpu', { get: () => '${userAgent.platform}' });
            
            // Vendor and product spoofing
            Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
            Object.defineProperty(navigator, 'product', { get: () => 'Gecko' });
            Object.defineProperty(navigator, 'productSub', { get: () => '20030107' });
            Object.defineProperty(navigator, 'vendorSub', { get: () => '' });
            
            // Chrome object with realistic properties
            window.chrome = {
                runtime: {
                    onConnect: null,
                    onMessage: null
                },
                webstore: {
                    onInstallStageChanged: null,
                    onDownloadProgress: null
                },
                app: {
                    isInstalled: false,
                    InstallState: {
                        DISABLED: 'disabled',
                        INSTALLED: 'installed',
                        NOT_INSTALLED: 'not_installed'
                    },
                    RunningState: {
                        CANNOT_RUN: 'cannot_run',
                        READY_TO_RUN: 'ready_to_run',
                        RUNNING: 'running'
                    }
                },
                csi: function() { return {}; },
                loadTimes: function() { 
                    return {
                        requestTime: Date.now() / 1000 - Math.random() * 2,
                        startLoadTime: Date.now() / 1000 - Math.random() * 1.5,
                        commitLoadTime: Date.now() / 1000 - Math.random() * 1,
                        finishDocumentLoadTime: Date.now() / 1000 - Math.random() * 0.5,
                        finishLoadTime: Date.now() / 1000 - Math.random() * 0.2,
                        firstPaintTime: Date.now() / 1000 - Math.random() * 0.1,
                        firstPaintAfterLoadTime: 0,
                        navigationType: 'navigate',
                        wasFetchedViaSpdy: false,
                        wasNpnNegotiated: false,
                        npnNegotiatedProtocol: '',
                        wasAlternateProtocolAvailable: false,
                        connectionInfo: 'http/1.1'
                    };
                }
            };
            
            // Languages with regional variations
            Object.defineProperty(navigator, 'languages', { 
                get: () => ['${userAgent.language}'.split(',')[0], 'en'] 
            });
            Object.defineProperty(navigator, 'language', { 
                get: () => '${userAgent.locale}' 
            });
            
            // Enhanced permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => {
                const permissions = {
                    'notifications': Math.random() > 0.5 ? 'granted' : 'default',
                    'geolocation': Math.random() > 0.7 ? 'granted' : 'denied',
                    'camera': 'denied',
                    'microphone': 'denied'
                };
                return Promise.resolve({ 
                    state: permissions[parameters.name] || 'prompt' 
                });
            };
            
            // Hardware concurrency (realistic CPU cores)
            Object.defineProperty(navigator, 'hardwareConcurrency', { 
                get: () => [2, 4, 6, 8, 12, 16][Math.floor(Math.random() * 6)]
            });
            
            // Device memory (realistic RAM)
            Object.defineProperty(navigator, 'deviceMemory', { 
                get: () => [2, 4, 8, 16, 32][Math.floor(Math.random() * 5)]
            });
            
            // Enhanced connection simulation
            Object.defineProperty(navigator, 'connection', { 
                get: () => ({
                    effectiveType: ['slow-2g', '2g', '3g', '4g'][Math.floor(Math.random() * 4)],
                    rtt: Math.floor(Math.random() * 200 + 50),
                    downlink: Math.floor(Math.random() * 50 + 5),
                    saveData: Math.random() > 0.8,
                    type: ['bluetooth', 'cellular', 'ethernet', 'wifi', 'wimax'][Math.floor(Math.random() * 5)]
                })
            });
            
            // Screen properties with realistic values
            Object.defineProperty(screen, 'colorDepth', { get: () => [24, 32][Math.floor(Math.random() * 2)] });
            Object.defineProperty(screen, 'pixelDepth', { get: () => [24, 32][Math.floor(Math.random() * 2)] });
            Object.defineProperty(screen, 'availWidth', { get: () => screen.width - Math.floor(Math.random() * 100) });
            Object.defineProperty(screen, 'availHeight', { get: () => screen.height - Math.floor(Math.random() * 150 + 50) });
            
            // Enhanced WebGL fingerprint randomization
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                const vendors = ['Intel Inc.', 'NVIDIA Corporation', 'AMD', 'Apple Inc.'];
                const renderers = [
                    'Intel(R) Iris(TM) Graphics 6100',
                    'NVIDIA GeForce GTX 1060',
                    'AMD Radeon RX 580',
                    'Apple M1',
                    'Intel(R) UHD Graphics 620'
                ];
                
                if (parameter === 37445) return vendors[Math.floor(Math.random() * vendors.length)];
                if (parameter === 37446) return renderers[Math.floor(Math.random() * renderers.length)];
                return getParameter.call(this, parameter);
            };
            
            // Enhanced canvas fingerprint randomization
            const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = function() {
                const imageData = originalGetImageData.apply(this, arguments);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] += Math.floor(Math.random() * 20 - 10);
                    imageData.data[i + 1] += Math.floor(Math.random() * 20 - 10);
                    imageData.data[i + 2] += Math.floor(Math.random() * 20 - 10);
                }
                return imageData;
            };
            
            // Audio context fingerprint randomization
            const audioContext = window.AudioContext || window.webkitAudioContext;
            if (audioContext) {
                const originalCreateAnalyser = audioContext.prototype.createAnalyser;
                audioContext.prototype.createAnalyser = function() {
                    const analyser = originalCreateAnalyser.apply(this, arguments);
                    const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
                    analyser.getFloatFrequencyData = function(array) {
                        originalGetFloatFrequencyData.apply(this, arguments);
                        for (let i = 0; i < array.length; i++) {
                            array[i] += Math.random() * 0.2 - 0.1;
                        }
                    };
                    return analyser;
                };
            }
            
            // Enhanced timezone and locale
            Intl.DateTimeFormat.prototype.resolvedOptions = function() {
                return {
                    locale: '${userAgent.locale}',
                    timeZone: '${userAgent.timezone}',
                    calendar: 'gregory',
                    numberingSystem: 'latn',
                    currency: '${userAgent.currency}'
                };
            };
            
            // Battery API spoofing
            if (navigator.getBattery) {
                navigator.getBattery = () => Promise.resolve({
                    charging: Math.random() > 0.5,
                    chargingTime: Math.random() * 7200,
                    dischargingTime: Math.random() * 28800,
                    level: Math.random() * 0.8 + 0.2
                });
            }
            
            // Media devices spoofing
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices = () => Promise.resolve([
                    { deviceId: 'default', kind: 'audioinput', label: '', groupId: 'group1' },
                    { deviceId: 'default', kind: 'audiooutput', label: '', groupId: 'group1' }
                ]);
            }
            
            // Plugin spoofing
            Object.defineProperty(navigator, 'plugins', {
                get: () => ({
                    length: Math.floor(Math.random() * 5 + 2),
                    item: () => null,
                    namedItem: () => null,
                    refresh: () => {}
                })
            });
        `);

        await context.clearCookies();
        await context.clearPermissions();

        page = await context.newPage();
        console.log(`${userAgent.flag} Page created for view ${viewIndex}/${totalViews} from ${userAgent.region}`);
        io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Page created for view ${viewIndex}/${totalViews} from ${userAgent.region}` });

        // Navigate to YouTube video with retry logic
        let pageLoaded = false;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 60000 
                });
                
                if (response && response.status() >= 400) {
                    console.log(`${userAgent.flag} HTTP error ${response.status()} for view ${viewIndex} from ${userAgent.region}`);
                    io.to(socketId).emit('bot_update', { message: `${userAgent.flag} HTTP error ${response.status()} for view ${viewIndex} from ${userAgent.region}` });
                    continue;
                }
                
                pageLoaded = true;
                console.log(`${userAgent.flag} YouTube page loaded for view ${viewIndex}/${totalViews} from ${userAgent.region}`);
                io.to(socketId).emit('bot_update', { message: `${userAgent.flag} YouTube page loaded for view ${viewIndex}/${totalViews} from ${userAgent.region}` });
                break;
            } catch (e) {
                console.log(`${userAgent.flag} Navigation error attempt ${attempt+1} for view ${viewIndex}: ${e}`);
                io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Navigation error attempt ${attempt+1} for view ${viewIndex}: ${e}` });
                if (attempt === 2) throw e;
                await page.waitForTimeout(3000);
            }
        }

        if (!pageLoaded) {
            console.log(`${userAgent.flag} Failed to load YouTube page for view ${viewIndex}`);
            return;
        }

        // Wait for video to load
        await page.waitForTimeout(4000);
        
        // Take initial screenshot
        try {
            const screenshot = await page.screenshot({ fullPage: false });
            io.to(socketId).emit('screenshot', { 
                image: screenshot.toString('base64'), 
                context: `${userAgent.flag} Initial load - View ${viewIndex} from ${userAgent.region}` 
            });
        } catch (e) {
            console.log(`Screenshot error: ${e}`);
        }

        // Close any popups/ads with enhanced detection
        try {
            const popupSelectors = [
                'button[aria-label="Skip Ads"]',
                'button[aria-label="Skip ad"]',
                '.ytp-ad-skip-button',
                'button[class*="skip"]',
                'button[aria-label="Close"]',
                '.ytd-popup-container button',
                '[aria-label="Dismiss"]',
                '.ytd-consent-bump-v2-lightbox button',
                'ytd-button-renderer[aria-label="Accept all"]'
            ];
            
            for (const selector of popupSelectors) {
                const elements = await page.$$(selector);
                for (const element of elements) {
                    try {
                        await element.click({ timeout: 1000 });
                        console.log(`${userAgent.flag} Closed popup for view ${viewIndex}`);
                        io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Closed popup for view ${viewIndex}` });
                    } catch (e) {}
                }
            }
        } catch (e) {}

        // Find and interact with video player
        let videoWatched = false;
        try {
            // Wait for video element with longer timeout
            await page.waitForSelector('video', { timeout: 15000 });
            
            const video = await page.$('video');
            if (video) {
                // Click to ensure video plays
                await video.click();
                await page.waitForTimeout(2000);
                
                // Check if video is playing
                const isPlaying = await page.evaluate(() => {
                    const video = document.querySelector('video');
                    return video && !video.paused && !video.ended && video.readyState > 2;
                });
                
                if (isPlaying) {
                    console.log(`${userAgent.flag} Video started playing for view ${viewIndex} from ${userAgent.region}`);
                    io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Video started playing for view ${viewIndex} from ${userAgent.region}` });
                    
                    // Watch for realistic duration (45-105 seconds)
                    const watchDuration = Math.floor(Math.random() * 60000 + 45000); // 45-105 seconds
                    const screenshotInterval = Math.floor(Math.random() * 6 + 5); // 5-10ms intervals
                    let screenshotCount = 0;
                    const maxScreenshots = Math.floor(watchDuration / screenshotInterval);
                    
                    console.log(`${userAgent.flag} Watching video for ${watchDuration/1000}s with screenshots every ${screenshotInterval}ms`);
                    io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Watching video for ${watchDuration/1000}s with screenshots every ${screenshotInterval}ms` });
                    
                    const startTime = Date.now();
                    const screenshotTimer = setInterval(async () => {
                        try {
                            if (screenshotCount < maxScreenshots && Date.now() - startTime < watchDuration) {
                                const screenshot = await page.screenshot({ fullPage: false });
                                io.to(socketId).emit('screenshot', { 
                                    image: screenshot.toString('base64'), 
                                    context: `${userAgent.flag} Watching - View ${viewIndex} (${Math.floor((Date.now() - startTime)/1000)}s) from ${userAgent.region}` 
                                });
                                screenshotCount++;
                            } else {
                                clearInterval(screenshotTimer);
                            }
                        } catch (e) {
                            clearInterval(screenshotTimer);
                        }
                    }, screenshotInterval);
                    
                    // Simulate advanced human behavior during video watching
                    const behaviorInterval = setInterval(async () => {
                        if (Date.now() - startTime < watchDuration) {
                            await simulateAdvancedHumanBehavior(page, socketId, viewIndex, userAgent);
                        } else {
                            clearInterval(behaviorInterval);
                        }
                    }, Math.floor(Math.random() * 12000 + 8000)); // Every 8-20 seconds
                    
                    // Wait for the full watch duration
                    await page.waitForTimeout(watchDuration);
                    
                    clearInterval(screenshotTimer);
                    clearInterval(behaviorInterval);
                    
                    videoWatched = true;
                    console.log(`${userAgent.flag} Successfully watched video for ${watchDuration/1000}s - View ${viewIndex} from ${userAgent.region}`);
                    io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Successfully watched video for ${watchDuration/1000}s - View ${viewIndex} from ${userAgent.region}` });
                }
            }
        } catch (e) {
            console.log(`${userAgent.flag} Video interaction error for view ${viewIndex}: ${e}`);
            io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Video interaction error for view ${viewIndex}: ${e}` });
        }

        if (!videoWatched) {
            console.log(`${userAgent.flag} Failed to watch video properly for view ${viewIndex}`);
            io.to(socketId).emit('bot_update', { message: `${userAgent.flag} Failed to watch video properly for view ${viewIndex}` });
            return;
        }

        // Final screenshot
        try {
            const screenshot = await page.screenshot({ fullPage: false });
            io.to(socketId).emit('screenshot', { 
                image: screenshot.toString('base64'), 
                context: `${userAgent.flag} Completed - View ${viewIndex} from ${userAgent.region}` 
            });
        } catch (e) {}

        console.log(`✅ ${userAgent.flag} View ${viewIndex}/${totalViews} completed successfully from ${userAgent.region}`);
        io.to(socketId).emit('bot_update', { message: `✅ ${userAgent.flag} View ${viewIndex}/${totalViews} completed successfully from ${userAgent.region}` });

    } catch (e) {
        console.log(`❌ Error on view ${viewIndex}/${totalViews}: ${e}`);
        io.to(socketId).emit('bot_update', { message: `❌ Error on view ${viewIndex}/${totalViews}: ${e}` });
    } finally {
        if (page) await page.close().catch(() => {});
        if (context) await context.close().catch(() => {});
    }
}

async function runViewBot(url, views, socketId) {
    const normalizedUrl = normalizeYouTubeUrl(url);
    
    if (!normalizedUrl.includes('youtube.com/watch')) {
        io.to(socketId).emit('bot_update', { message: '❌ Invalid URL. Please provide a valid YouTube video URL or YouTube Shorts URL.' });
        return;
    }

    let browser;
    try {
        browser = await chromium.launch({ 
            headless: true, 
            args: [
                '--no-sandbox', 
                '--disable-dev-shm-usage', 
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-default-apps',
                '--disable-popup-blocking',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',
                '--disable-javascript-harmony-shipping',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-field-trial-config',
                '--disable-back-forward-cache',
                '--disable-ipc-flooding-protection'
            ] 
        });
        
        console.log('🚀 Browser launched successfully');
        io.to(socketId).emit('bot_update', { message: '🚀 Browser launched successfully' });

        // Process views sequentially with breaks
        for (let i = 0; i < Math.min(views, 100); i++) {
            await processView(normalizedUrl, i + 1, views, socketId, browser);
            
            // 10-15 second break between views
            if (i < views - 1) {
                const breakTime = Math.floor(Math.random() * 5000 + 10000); // 10-15 seconds
                console.log(`⏳ Taking ${breakTime/1000}s break before next view...`);
                io.to(socketId).emit('bot_update', { message: `⏳ Taking ${breakTime/1000}s break before next view...` });
                await new Promise(resolve => setTimeout(resolve, breakTime));
            }
        }

        console.log('🎉 All views completed successfully!');
        io.to(socketId).emit('bot_update', { message: '🎉 All views completed successfully!' });
        
    } catch (e) {
        console.log(`❌ Bot error: ${e}`);
        io.to(socketId).emit('bot_update', { message: `❌ Bot error: ${e}` });
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

app.post('/start', async (req, res) => {
    let { url, views, socketId } = req.body;
    
    url = normalizeYouTubeUrl(url);
    if (!url.includes('youtube.com/watch')) {
        return res.status(400).json({ error: 'Invalid URL. Please provide a valid YouTube video URL or YouTube Shorts URL.' });
    }
    
    if (!Number.isInteger(views) || views < 1 || views > 100) {
        return res.status(400).json({ error: 'Views must be between 1 and 100' });
    }
    
    runViewBot(url, views, socketId).catch(e => {
        console.log(`Bot error: ${e}`);
        io.to(socketId).emit('bot_update', { message: `Bot error: ${e}` });
    });
    
    res.status(200).json({ message: 'YouTube View Bot started successfully!' });
});

server.listen(3000, () => {
    console.log('🎬 Advanced YouTube View Bot running on http://localhost:3000');
});