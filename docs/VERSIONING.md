> **Vintage vibe, modern build.**  
*fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Versioning & Releases (Automatic) / เวอร์ชันและการปล่อยรีลีส (อัตโนมัติ)

fare ใช้ workflow อัตโนมัติที่รวม **Conventional Commits**, **Changesets**, และ **GitHub Actions** (changesets/action) เพื่อสร้าง PR เวอร์ชัน, อัปเดต changelog, และ publish เมื่อพร้อม

## Overview
- commit ต้องเป็นแบบ Conventional (เช่น `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`) เพื่อให้ release type ถูกระบุโดยอัตโนมัติ
- `changeset` CLI สร้างไฟล์ใน `.changeset/` ที่บอกว่าจะ bump version แบบ patch/minor/major และเก็บ release note สั้น ๆ
- GH Actions (`.github/workflows/release.yml`) รันเมื่อ push เข้า `main`, โค้ดจะถูก build/test, แล้ว action จะสร้าง PR `chore(release): version packages` ที่รวมเวอร์ชัน bump + changelog
- เมื่อตรวจ PR แล้ว merge, action จะ publish package (ถ้ามี `NPM_TOKEN`) และสร้าง tag/release บน GitHub

## Setup checklist
1. ตรวจว่า `package.json` มี script `changeset`, `version-packages`, `release` (ดู `package.json`).
2. `changeset` config (.changeset/config.json) คอนฟิก repo, baseBranch (`main`), changelog generator, access และการ update dependencies ภายใน
3. Husky + commitlint (script `prepare` รัน `husky`) enforce conventional commit message
4. กำหนด secret (ถ้าจะ publish): `NPM_TOKEN` ใน GitHub repository (publish stage จะใช้ token นี้)

## Daily workflow
1. พัฒนา feature/bug fix + run tests/build (`npm run lint`, `npm run build`, `npm run docs:build` ถ้ามี)
2. Commit โดยใช้ Conventional form, เช่น `feat: add guard docs`
3. สร้าง changeset:
   ```bash
   npm run changeset
   ```
   - เลือก package (`@cod9fair/fare`) และ bump type (patch/minor/major)
   - อธิบาย release note (จุดที่จะแสดงใน changelog)
   - ระบบจะสร้างไฟล์ `.changeset/<id>.md`
4. ตรวจ diff (.changeset file + package.json) และ push ไป `main`

## Anatomy of a changeset file
```md
---
"fare": minor
---
Improve routing guard docs and auth explanation.
```
- `"fare": minor` บอกว่า release นี้เป็น minor change
- คำอธิบายภายใต้ `---` ใช้เพื่อเติม release notes ใน changelog/release PR
- สามารถลบ/แก้ไฟล์ได้ก่อน push ถ้าต้องการเปลี่ยน type

## Release PR ✅
- หลัง push, GH Action จะรัน `release.yml`:
  1. เรียก `npm ci`
  2. `changesets/action@v1` สร้าง PR `chore(release): version packages` โดยเรียก `npm run version-packages` (ซึ่งคือ `changeset version`)
  3. PR จะมี diff: bump `package.json`, `package-lock.json`, update `CHANGELOG.md`, remove processed `.changeset` files
  4. Action ไม่ commit เอง (`commit: false`), PR ถูกสร้างด้วย diff
- Review PR: ตรวจว่ามี release note ครบ, version bump 0.x.x เพิ่ม, และ CI ผ่าน
- Merge PR → action ตัวที่สองจะรัน `npm run release` (alias `changeset publish`)
  - ถ้ามี `NPM_TOKEN`, จะ publish package ไป npm
  - จะสร้าง git tag (เช่น `v0.0.5`) และ release entry จาก changelog

## Local release preview
- สั่ง `npm run version-packages` เพื่อ preview diffs ของ version bump ก่อน push
- `npm run release` ก็สามารถรัน manual ถ้ามี token (ตัว Action ใช้คำสั่งนี้หลัง merge)

## Post-release verification
- เช็ค `package.json`/`package-lock.json` ว่ามี version ใหม่
- ดู `CHANGELOG.md` ว่ามีหัวข้อ release note ละเอียดพอ
- หาก publish ไป npm แล้ว, สั่ง `npm view @cod9fair/fare version`
- ดู GitHub Releases page ว่ามี tag และ release note

## Troubleshooting
- `_release.yml` ไม่ขึ้น PR? ตรวจว่า push ไป `main` ไม่ใช่ branch อื่น
- Changeset file ขาด? เพิ่มไฟล์ใหม่แล้ว push จะ trigger PR ใหม่
- ต้องการแก้ release type? แก้ `.changeset/<id>.md` (หรือ runner จะ fail) แล้ว rerun `npm run version-packages` ก่อน commit
- Publish stage fail (ไม่มี `NPM_TOKEN`)? action ยังสร้าง PR แต่ publish จะ fail พร้อม log; เพิ่ม token หรือ ปิด stage ด้วย `publish: ''` ใน workflow หากไม่ต้องการ publish

## Tips
- ไม่ต้องรัน `npm run release` ก่อน push; workflow จะทำให้
- หากเพิ่ม package มากกว่าหนึ่งตัวใน repo, สามารถเลือก package ใน `changeset` prompt
- อัพเดต `.changeset/config.json` เมื่อเปลี่ยน `repo`/`baseBranch`/`changelog`
