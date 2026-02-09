# Cursor 绕过 Clash 代理完整操作指南

## 目标
配置 Clash for Windows，使 **Cursor 直连（不走代理）**，其他应用正常走代理。

---

## 前置条件

- ✅ 已安装 **Clash for Windows (CFW)**
- ✅ 已安装 **Cursor**
- ✅ Clash 已配置并正常运行（能正常代理其他应用）

---

## 完整操作步骤

### 第一步：开启 TUN 模式（必须）

1. 打开 **Clash for Windows**
2. 点击左侧菜单的 **"设置"（Settings）**
3. 找到 **"TUN 模式"（TUN Mode）** 开关
4. 点击开关，将其从 **红色（关闭）** 变为 **绿色（开启）**
5. 如果弹出 "TUN 模式设置" 对话框：
   - DNS 设置保持默认即可（或使用推荐的 DNS：`114.114.114.114`, `223.5.5.5`, `8.8.8.8`）
   - 点击底部的 **"保存"** 按钮
6. 等待 TUN 模式启动完成（可能需要几秒钟）

> **为什么需要 TUN 模式？**  
> `PROCESS-NAME` 规则需要 TUN 模式才能生效。如果不开 TUN，即使加了规则，Cursor 也可能走系统代理。

---

### 第二步：在 Clash 配置文件中添加 Cursor 直连规则

1. 在 Clash for Windows 中，点击左侧菜单的 **"配置"（Profiles）** 或 **"配置"（Configuration）**
2. 找到当前正在使用的配置（前面有 ✓ 标记的那个）
3. 点击配置右侧的 **`...`** 按钮
4. 选择 **"编辑"（Edit）** 或 **"Edit"**
5. 配置文件会在文本编辑器中打开（通常是 YAML 格式）

6. 找到 `rules:` 这一段（通常在文件末尾，格式如下）：
   ```yaml
   rules:
     - GEOIP,CN,DIRECT
     - MATCH,Proxy
   ```

7. **在 `rules:` 的最前面（第一行）** 插入以下规则：
   ```yaml
   rules:
     - PROCESS-NAME,cursor.exe,DIRECT
     # 你原来的规则继续写在下面
     - GEOIP,CN,DIRECT
     - MATCH,Proxy
   ```

   > **重要提示：**
   > - 规则必须放在 `rules:` 的最前面，**在所有其他规则之前**
   > - 如果 Cursor 的进程名不是 `cursor.exe`，可以尝试 `Cursor.exe`（注意大小写）
   > - 如果仍有问题，可以同时添加两条规则：
   >   ```yaml
   >   rules:
   >     - PROCESS-NAME,cursor.exe,DIRECT
   >     - PROCESS-NAME,Cursor.exe,DIRECT
   >     # 其他规则...
   >   ```

8. **保存文件**（`Ctrl + S`）
9. 关闭编辑器
10. 回到 Clash for Windows，在配置右侧点击 **"更新"（Update）** 或 **"重新加载"（Reload）** 按钮
11. 等待配置重新加载完成

---

### 第三步：在 Cursor 中关闭代理支持（双保险）

#### 方法一：通过设置界面（推荐）

1. 打开 **Cursor**
2. 按 **`Ctrl + ,`** 打开 **Settings（设置）**
3. 在右上角搜索框输入：`proxy` 或 `network`
4. 找到 **"代理服务器"（Proxy Servers）** 分类
5. 取消勾选以下选项：
   - ✅ **`Http: Fetch Additional Support`**（适用所有配置文件）
     - 这个选项明确提到"代理支持(Http: Proxy Support)"，关闭它会禁用代理支持
   - ✅ **`Http: Use Local Proxy Configuration`**（可选，如果上面关闭后仍有问题）
     - 控制是否在远程扩展主机中使用本地代理配置
6. 关闭设置窗口
7. **重启 Cursor**

#### 方法二：通过 settings.json（如果方法一找不到选项）

1. 在 Cursor 中按 **`Ctrl + Shift + P`** 打开命令面板
2. 输入并选择：**`Preferences: Open Settings (JSON)`**（中文：首选项：打开设置（JSON））
3. 在打开的 `settings.json` 中添加或修改：
   ```json
   {
     "http.proxySupport": "off",
     // 其他配置...
   }
   ```
4. 保存文件（`Ctrl + S`）
5. **重启 Cursor**

---

### 第四步：验证配置是否成功

#### 验证方法一：查看 Clash 连接页面（最直观）

1. 打开 **Clash for Windows**
2. 点击左侧菜单的 **"连接"（Connections）**
3. 在 Cursor 中做一些需要联网的操作（例如：使用 AI 功能、搜索代码、打开扩展市场等）
4. 回到 Clash 的"连接"页面，查看连接列表

**预期结果（配置成功）：**
- ✅ 看到 `Cursor.exe` 或 `cursor.exe` 的连接
- ✅ 这些连接的 "Origin/Process/Rule" 字段显示为 **`DIRECT`**
- ✅ 其他应用的连接正常走代理（显示代理节点名称）

**如果配置失败：**
- ❌ `Cursor.exe` 的连接显示为某个代理节点名称（如 `日本03|专线|20倍流量`）
- ❌ 说明规则未生效，需要检查：
  - TUN 模式是否已开启
  - 规则是否放在 `rules:` 最前面
  - 配置是否已重新加载

#### 验证方法二：使用 PowerShell 测试（可选）

1. 打开 PowerShell
2. 运行以下命令检查系统代理状态：
   ```powershell
   # 检查系统代理是否禁用
   (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings").ProxyEnable
   # 输出应该是 0（禁用）或 1（启用）
   ```

3. 运行以下命令查看 Cursor 进程的网络连接：
   ```powershell
   # 查看 cursor.exe 的网络连接
   Get-NetTCPConnection -ErrorAction SilentlyContinue | 
     Where-Object {$_.OwningProcess -in (Get-Process | Where-Object {$_.ProcessName -like "*cursor*"}).Id} | 
     Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, State
   ```

---

## 配置完成后的效果

- ✅ **Cursor 的所有网络连接都是 DIRECT（直连）**
- ✅ **其他应用（浏览器、命令行等）正常走 Clash 代理**
- ✅ **Clash 正常工作，不影响其他应用的代理功能**

---

## 常见问题排查

### 问题 1：Cursor 仍然走代理

**可能原因：**
- TUN 模式未开启
- 规则位置不对（没有放在 `rules:` 最前面）
- 配置未重新加载
- Cursor 内部代理设置未关闭

**解决方法：**
1. 确认 TUN 模式已开启（绿色）
2. 检查规则是否在 `rules:` 最前面
3. 重新加载 Clash 配置
4. 在 Cursor 中关闭 `Http: Fetch Additional Support`
5. 重启 Cursor

### 问题 2：其他应用也无法走代理

**可能原因：**
- TUN 模式配置有问题
- DNS 设置错误

**解决方法：**
1. 检查 TUN 模式的 DNS 设置
2. 尝试重启 Clash for Windows
3. 检查其他应用的连接是否正常

### 问题 3：找不到 Cursor 的连接记录

**可能原因：**
- Cursor 没有进行网络请求
- 连接已过期（Clash 只显示最近的活动连接）

**解决方法：**
1. 在 Cursor 中主动触发网络请求（使用 AI 功能、搜索代码等）
2. 立即查看 Clash 的连接页面
3. 如果仍看不到，说明 Cursor 可能已经完全绕过 Clash（这是好事）

### 问题 4：规则语法错误导致 Clash 无法启动

**可能原因：**
- YAML 格式错误（缩进、引号等）
- 规则语法错误

**解决方法：**
1. 检查 YAML 文件的缩进（使用空格，不要用 Tab）
2. 确认规则格式正确：`- PROCESS-NAME,cursor.exe,DIRECT`
3. 如果 Clash 无法启动，删除刚才添加的规则，重新添加

---

## 完整配置示例

以下是一个完整的 Clash 配置文件示例（`rules:` 部分）：

```yaml
# ... 其他配置（proxies, proxy-groups, dns 等）...

rules:
  # Cursor 直连规则（必须放在最前面）
  - PROCESS-NAME,cursor.exe,DIRECT
  - PROCESS-NAME,Cursor.exe,DIRECT
  
  # 其他规则
  - DOMAIN-SUFFIX,services.googleapis.cn,一元机场
  - GEOIP,CN,DIRECT
  - MATCH,Proxy
```

---

## 注意事项

1. **规则顺序很重要**：`PROCESS-NAME` 规则必须放在 `rules:` 最前面，否则可能被其他规则覆盖
2. **TUN 模式必须开启**：没有 TUN 模式，`PROCESS-NAME` 规则无法生效
3. **配置修改后必须重新加载**：修改配置文件后，记得在 Clash 中重新加载配置
4. **Cursor 需要重启**：修改 Cursor 的代理设置后，需要重启 Cursor 才能生效
5. **进程名大小写敏感**：如果 `cursor.exe` 不生效，可以尝试 `Cursor.exe`

---

## 总结

完成以上四个步骤后，Cursor 将绕过 Clash 代理，直接连接互联网，而其他应用继续正常使用 Clash 代理。这是最理想的配置状态。

**配置成功标志：**
- Clash 连接页面中，`Cursor.exe` 的连接显示为 `DIRECT`
- 其他应用的连接正常走代理
- Cursor 可以正常使用（AI 功能、扩展市场等）

---

## 参考

- [Clash for Windows 官方文档](https://github.com/Fndroid/clash_for_windows_pkg)
- [Clash 规则配置说明](https://clash.gitbook.io/doc/rule-provider)

