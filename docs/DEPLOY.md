> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Deploy / การ Deploy

## SPA rewrite (สำคัญ)
refresh ที่ `/users/u1` ต้องเสิร์ฟ `index.html`

### Nginx
```nginx
try_files $uri /index.html;
```

### Netlify
`_redirects`
```
/*  /index.html  200
```

## HTTPS
Service Worker ต้องใช้ HTTPS (ยกเว้น localhost)
