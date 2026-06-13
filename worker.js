// worker.js - فایل اصلی پروکسی شما
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // نمایش پنل HTML وقتی کاربر به آدرس اصلی یا /panel بره
        if (path === '/' || path === '/panel') {
            // اینجا محتوای my-panel.html رو فراخوانی می‌کنیم
            // فعلاً یه صفحه ساده که ریدایرکت میکنه به فایل HTML
            return fetch(new URL('/my-panel.html', request.url));
        }
        
        // API های پنل (برای دکمه‌ها)
        if (path === '/api/scan-ip') {
            return new Response(JSON.stringify({ 
                success: true, 
                ip: "104.18.25.41",
                message: "IP تمیز پیدا شد: 104.18.25.41"
            }), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (path === '/api/make-config') {
            return new Response(JSON.stringify({ 
                success: true,
                subscribeLink: url.origin + "/subscribe",
                configBase64: "dGVzdCBjb25maWc="
            }), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (path === '/api/iran-mode') {
            return new Response(JSON.stringify({ 
                success: true,
                message: "حالت ایران فعال شد"
            }), { headers: { 'Content-Type': 'application/json' } });
        }
        
        // بقیه درخواست‌ها - پیام پیش‌فرض
        return new Response("پروکسی فعال است. برای ورود به پنل به /panel بروید.", {
            headers: { 'Content-Type': 'text/plain' }
        });
    }
};
