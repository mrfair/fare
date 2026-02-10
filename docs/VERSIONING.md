> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---

# Versioning & Releases (Automatic) / เวอร์ชันและการปล่อยรีลีส (อัตโนมัติ)

fare ใช้ **Changesets + Conventional Commits** เพื่อทำ version bump / release PR / publish อัตโนมัติ

## TL;DR (Workflow)
1) commit ด้วย Conventional Commit (เช่น `feat: ...`, `fix: ...`)
2) สร้าง changeset:
```bash
npm run changeset
```
3) push / merge เข้า `main`
4) GitHub Actions จะสร้าง PR: **chore(release): version packages**
5) merge PR → bump version + (ถ้าตั้งค่า `NPM_TOKEN`) publish อัตโนมัติ

## Conventional Commits (ตัวอย่าง)
- `feat: add nested route outlet`
- `fix: auto-destroy listeners on DOM removal`
- `docs: improve routing guide`
- `chore: upgrade deps`

## Changesets (ทำไมต้องมี)
Changeset คือไฟล์เล็ก ๆ ที่บอกว่า “การเปลี่ยนแปลงนี้ควร bump version แบบไหน”
- patch: bug fix
- minor: feature ใหม่ที่ไม่ breaking
- major: breaking change

## Publish to npm (optional)
ถ้าคุณอยาก publish เป็น npm package:
1) สร้าง npm token และตั้ง GitHub Secret ชื่อ `NPM_TOKEN`
2) เปลี่ยน `package.json` ให้มี `name` ที่ publish ได้ (เช่น `@your-scope/fare`)
3) merge release PR แล้ว workflow จะ publish ให้อัตโนมัติ

> ถ้าไม่ตั้ง `NPM_TOKEN` workflow ยังสร้าง release PR ได้ตามปกติ แต่ขั้น publish จะ fail (แก้ได้โดยเอา publish ออก หรือใส่ NPM_TOKEN)
