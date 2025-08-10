const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { chromium } = require('playwright');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('static'));
app.use(express.json());

// Enhanced user agents with more realistic browser fingerprints
const userAgents = [
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'en-US', 
        region: 'United States',
        timezone: 'America/New_York',
        platform: 'Win32'
    },
    { 
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36', 
        locale: 'en-GB', 
        region: 'United Kingdom',
        timezone: 'Europe/London',
        platform: 'MacIntel'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0', 
        locale: 'fr-FR', 
        region: 'France',
        timezone: 'Europe/Paris',
        platform: 'Win32'
    },
    { 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 
        locale: 'ja-JP', 
        region: 'Japan',
        timezone: 'Asia/Tokyo',
        platform: 'iPhone'
    },
    { 
        ua: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 
        locale: 'de-DE', 
        region: 'Germany',
        timezone: 'Europe/Berlin',
        platform: 'Linux armv81'
    },
    { 
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', 
        locale: 'es-ES', 
        region: 'Spain',
        timezone: 'Europe/Madrid',
        platform: 'MacIntel'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0', 
        locale: 'en-AU', 
        region: 'Australia',
        timezone: 'Australia/Sydney',
        platform: 'Win32'
    },
    { 
        ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'pt-BR', 
        region: 'Brazil',
        timezone: 'America/Sao_Paulo',
        platform: 'Linux x86_64'
    },
    { 
        ua: 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 
        locale: 'zh-CN', 
        region: 'China',
        timezone: 'Asia/Shanghai',
        platform: 'iPad'
    },
    { 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
        locale: 'it-IT', 
        region: 'Italy',
        timezone: 'Europe/Rome',
        platform: 'Win32'
    }
];

function normalizeYouTubeUrl(inputUrl) {
    let url = inputUrl.trim();
    
    // Handle various YouTube URL formats
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

async function simulateHumanBehavior(page, socketId, viewIndex, userAgent) {
    try {
        const viewport = await page.viewportSize();
        
        // Random mouse movements (more realistic patterns)
        for (let i = 0; i < Math.floor(Math.random() * 5 + 3); i++) {
            const x = Math.floor(Math.random() * viewport.width * 0.8 + viewport.width * 0.1);
            const y = Math.floor(Math.random() * viewport.height * 0.8 + viewport.height * 0.1);
            
            await page.mouse.move(x, y, { 
                steps: Math.floor(Math.random() * 20 + 10) 
            });
            await page.waitForTimeout(Math.floor(Math.random() * 800 + 200));
        }
        
        // Realistic scrolling behavior
        const scrollActions = Math.floor(Math.random() * 4 + 2);
        for (let i = 0; i < scrollActions; i++) {
            const scrollDistance = Math.floor(Math.random() * 300 + 100);
            const direction = Math.random() > 0.7 ? -1 : 1; // Mostly scroll down
            
            await page.evaluate(`window.scrollBy(0, ${scrollDistance * direction})`);
            await page.waitForTimeout(Math.floor(Math.random() * 1500 + 500));
        }
        
        // Simulate reading comments or looking at video details
        if (Math.random() < 0.4) {
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight * 0.3)');
            await page.waitForTimeout(Math.floor(Math.random() * 3000 + 2000));
            console.log(`Simulated reading comments for view ${viewIndex} from ${userAgent.region}`);
            io.to(socketId).emit('bot_update', { message: `Simulated reading comments for view ${viewIndex} from ${userAgent.region}` });
        }
        
        // Random pauses (like real users do)
        if (Math.random() < 0.3) {
            const pauseTime = Math.floor(Math.random() * 5000 + 2000);
            await page.waitForTimeout(pauseTime);
            console.log(`Random pause of ${pauseTime/1000}s for view ${viewIndex} from ${userAgent.region}`);
            io.to(socketId).emit('bot_update', { message: `Random pause of ${pauseTime/1000}s for view ${viewIndex} from ${userAgent.region}` });
        }
        
        // Simulate volume adjustment
        if (Math.random() < 0.2) {
            try {
                await page.keyboard.press('ArrowUp'); // Volume up
                await page.waitForTimeout(500);
                console.log(`Adjusted volume for view ${viewIndex} from ${userAgent.region}`);
                io.to(socketId).emit('bot_update', { message: `Adjusted volume for view ${viewIndex} from ${userAgent.region}` });
            } catch (e) {}
        }
        
    } catch (e) {
        console.log(`Error in human behavior simulation for view ${viewIndex}: ${e}`);
    }
}

async function processView(url, viewIndex, totalViews, socketId, browser) {
    let context, page;
    try {
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const isMobile = userAgent.ua.includes('Mobile') || userAgent.ua.includes('iPhone') || userAgent.ua.includes('Android') || userAgent.ua.includes('iPad');
        
        // More realistic viewport sizes
        const viewport = {
            width: isMobile ? 
                Math.floor(Math.random() * (414 - 360 + 1)) + 360 : 
                Math.floor(Math.random() * (1920 - 1024 + 1)) + 1024,
            height: isMobile ? 
                Math.floor(Math.random() * (896 - 640 + 1)) + 640 : 
                Math.floor(Math.random() * (1080 - 768 + 1)) + 768
        };

        context = await browser.newContext({
            userAgent: userAgent.ua,
            viewport,
            deviceScaleFactor: Math.random() * 1.5 + 1,
            isMobile,
            hasTouch: isMobile,
            locale: userAgent.locale,
            timezoneId: userAgent.timezone,
            javaScriptEnabled: true,
            bypassCSP: true,
            extraHTTPHeaders: {
                'Accept-Language': `${userAgent.locale},en;q=0.9`,
                'DNT': '1',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Dest': 'document',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-CH-UA-Mobile': isMobile ? '?1' : '?0',
                'Sec-CH-UA-Platform': `"${userAgent.platform}"`
            }
        });

        console.log(`Context created for view ${viewIndex}/${totalViews} from ${userAgent.region}`);
        io.to(socketId).emit('bot_update', { message: `Context created for view ${viewIndex}/${totalViews} from ${userAgent.region}` });

        // Enhanced browser fingerprint spoofing
        await context.addInitScript(`
            // Remove webdriver traces
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            delete navigator.__proto__.webdriver;
            
            // Spoof platform
            Object.defineProperty(navigator, 'platform', { get: () => '${userAgent.platform}' });
            
            // Enhanced vendor spoofing
            Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
            
            // Chrome object
            window.chrome = {
                runtime: {},
                webstore: {},
                app: {},
                csi: function() {},
                loadTimes: function() { return {}; }
            };
            
            // Languages
            Object.defineProperty(navigator, 'languages', { get: () => ['${userAgent.locale}', 'en'] });
            
            // Permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
            
            // Hardware concurrency
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => ${Math.floor(Math.random() * 8 + 2)} });
            
            // Device memory
            Object.defineProperty(navigator, 'deviceMemory', { get: () => ${Math.floor(Math.random() * 8 + 4)} });
            
            // Connection
            Object.defineProperty(navigator, 'connection', { 
                get: () => ({
                    effectiveType: '4g',
                    rtt: ${Math.floor(Math.random() * 50 + 20)},
                    downlink: ${Math.floor(Math.random() * 10 + 5)},
                    saveData: false
                })
            });
            
            // Screen properties
            Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
            Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
            
            // WebGL fingerprint randomization
            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) {
                    return 'Intel Inc.';
                }
                if (parameter === 37446) {
                    return 'Intel(R) Iris(TM) Graphics 6100';
                }
                return getParameter(parameter);
            };
            
            // Canvas fingerprint randomization
            const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
            CanvasRenderingContext2D.prototype.getImageData = function() {
                const imageData = originalGetImageData.apply(this, arguments);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] += Math.floor(Math.random() * 10 - 5);
                    imageData.data[i + 1] += Math.floor(Math.random() * 10 - 5);
                    imageData.data[i + 2] += Math.floor(Math.random() * 10 - 5);
                }
                return imageData;
            };
            
            // Audio context fingerprint
            const audioContext = window.AudioContext || window.webkitAudioContext;
            if (audioContext) {
                const originalCreateAnalyser = audioContext.prototype.createAnalyser;
                audioContext.prototype.createAnalyser = function() {
                    const analyser = originalCreateAnalyser.apply(this, arguments);
                    const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
                    analyser.getFloatFrequencyData = function(array) {
                        originalGetFloatFrequencyData.apply(this, arguments);
                        for (let i = 0; i < array.length; i++) {
                            array[i] += Math.random() * 0.1 - 0.05;
                        }
                    };
                    return analyser;
                };
            }
            
            // Timezone
            Intl.DateTimeFormat.prototype.resolvedOptions = function() {
                return {
                    locale: '${userAgent.locale}',
                    timeZone: '${userAgent.timezone}',
                    calendar: 'gregory',
                    numberingSystem: 'latn'
                };
            };
        `);

        await context.clearCookies();
        await context.clearPermissions();

        page = await context.newPage();
        console.log(`Page created for view ${viewIndex}/${totalViews} from ${userAgent.region}`);
        io.to(socketId).emit('bot_update', { message: `Page created for view ${viewIndex}/${totalViews} from ${userAgent.region}` });

        // Navigate to YouTube video
        let pageLoaded = false;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await page.goto(url, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 60000 
                });
                
                if (response && response.status() >= 400) {
                    console.log(`HTTP error ${response.status()} for view ${viewIndex} from ${userAgent.region}`);
                    io.to(socketId).emit('bot_update', { message: `HTTP error ${response.status()} for view ${viewIndex} from ${userAgent.region}` });
                    continue;
                }
                
                pageLoaded = true;
                console.log(`YouTube page loaded for view ${viewIndex}/${totalViews} from ${userAgent.region}`);
                io.to(socketId).emit('bot_update', { message: `YouTube page loaded for view ${viewIndex}/${totalViews} from ${userAgent.region}` });
                break;
            } catch (e) {
                console.log(`Navigation error attempt ${attempt+1} for view ${viewIndex}: ${e}`);
                io.to(socketId).emit('bot_update', { message: `Navigation error attempt ${attempt+1} for view ${viewIndex}: ${e}` });
                if (attempt === 2) throw e;
                await page.waitForTimeout(2000);
            }
        }

        if (!pageLoaded) {
            console.log(`Failed to load YouTube page for view ${viewIndex}`);
            return;
        }

        // Wait for video to load and start playing
        await page.waitForTimeout(3000);
        
        // Take initial screenshot
        try {
            const screenshot = await page.screenshot({ fullPage: false });
            io.to(socketId).emit('screenshot', { 
                image: screenshot.toString('base64'), 
                context: `Initial load - View ${viewIndex} from ${userAgent.region}` 
            });
        } catch (e) {
            console.log(`Screenshot error: ${e}`);
        }

        // Close any popups/ads
        try {
            const popupSelectors = [
                'button[aria-label="Skip Ads"]',
                'button[aria-label="Skip ad"]',
                '.ytp-ad-skip-button',
                'button[class*="skip"]',
                'button[aria-label="Close"]',
                '.ytd-popup-container button'
            ];
            
            for (const selector of popupSelectors) {
                const elements = await page.$$(selector);
                for (const element of elements) {
                    try {
                        await element.click({ timeout: 1000 });
                        console.log(`Closed popup for view ${viewIndex}`);
                        io.to(socketId).emit('bot_update', { message: `Closed popup for view ${viewIndex}` });
                    } catch (e) {}
                }
            }
        } catch (e) {}

        // Find and interact with video player
        let videoWatched = false;
        try {
            // Wait for video element
            await page.waitForSelector('video', { timeout: 10000 });
            
            const video = await page.$('video');
            if (video) {
                // Click to ensure video plays
                await video.click();
                await page.waitForTimeout(1000);
                
                // Check if video is playing
                const isPlaying = await page.evaluate(() => {
                    const video = document.querySelector('video');
                    return video && !video.paused && !video.ended && video.readyState > 2;
                });
                
                if (isPlaying) {
                    console.log(`Video started playing for view ${viewIndex} from ${userAgent.region}`);
                    io.to(socketId).emit('bot_update', { message: `Video started playing for view ${viewIndex} from ${userAgent.region}` });
                    
                    // Watch for realistic duration (45-105 seconds)
                    const watchDuration = Math.floor(Math.random() * 60000 + 45000); // 45-105 seconds
                    const screenshotInterval = 10; // 10ms intervals
                    let screenshotCount = 0;
                    const maxScreenshots = Math.floor(watchDuration / screenshotInterval);
                    
                    console.log(`Watching video for ${watchDuration/1000}s with screenshots every ${screenshotInterval}ms`);
                    io.to(socketId).emit('bot_update', { message: `Watching video for ${watchDuration/1000}s with screenshots every ${screenshotInterval}ms` });
                    
                    const startTime = Date.now();
                    const screenshotTimer = setInterval(async () => {
                        try {
                            if (screenshotCount < maxScreenshots && Date.now() - startTime < watchDuration) {
                                const screenshot = await page.screenshot({ fullPage: false });
                                io.to(socketId).emit('screenshot', { 
                                    image: screenshot.toString('base64'), 
                                    context: `Watching - View ${viewIndex} (${Math.floor((Date.now() - startTime)/1000)}s)` 
                                });
                                screenshotCount++;
                            } else {
                                clearInterval(screenshotTimer);
                            }
                        } catch (e) {
                            clearInterval(screenshotTimer);
                        }
                    }, screenshotInterval);
                    
                    // Simulate human behavior during video watching
                    const behaviorInterval = setInterval(async () => {
                        if (Date.now() - startTime < watchDuration) {
                            await simulateHumanBehavior(page, socketId, viewIndex, userAgent);
                        } else {
                            clearInterval(behaviorInterval);
                        }
                    }, Math.floor(Math.random() * 15000 + 10000)); // Every 10-25 seconds
                    
                    // Wait for the full watch duration
                    await page.waitForTimeout(watchDuration);
                    
                    clearInterval(screenshotTimer);
                    clearInterval(behaviorInterval);
                    
                    videoWatched = true;
                    console.log(`Successfully watched video for ${watchDuration/1000}s - View ${viewIndex} from ${userAgent.region}`);
                    io.to(socketId).emit('bot_update', { message: `Successfully watched video for ${watchDuration/1000}s - View ${viewIndex} from ${userAgent.region}` });
                }
            }
        } catch (e) {
            console.log(`Video interaction error for view ${viewIndex}: ${e}`);
            io.to(socketId).emit('bot_update', { message: `Video interaction error for view ${viewIndex}: ${e}` });
        }

        if (!videoWatched) {
            console.log(`Failed to watch video properly for view ${viewIndex}`);
            io.to(socketId).emit('bot_update', { message: `Failed to watch video properly for view ${viewIndex}` });
            return;
        }

        // Final screenshot
        try {
            const screenshot = await page.screenshot({ fullPage: false });
            io.to(socketId).emit('screenshot', { 
                image: screenshot.toString('base64'), 
                context: `Completed - View ${viewIndex} from ${userAgent.region}` 
            });
        } catch (e) {}

        console.log(`✅ View ${viewIndex}/${totalViews} completed successfully from ${userAgent.region}`);
        io.to(socketId).emit('bot_update', { message: `✅ View ${viewIndex}/${totalViews} completed successfully from ${userAgent.region}` });

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
        io.to(socketId).emit('bot_update', { message: 'Invalid URL. Please provide a valid YouTube video URL.' });
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
                '--disable-popup-blocking'
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
        return res.status(400).json({ error: 'Invalid URL. Please provide a valid YouTube video URL.' });
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
    console.log('🎬 YouTube View Bot running on http://localhost:3000');
});