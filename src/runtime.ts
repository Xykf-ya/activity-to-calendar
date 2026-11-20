import * as sdk from "scripting"
import { UserError } from "./core"

// Native APIs are supplied as globals by Scripting. Some releases also export
// them. Resolve at the call site so an unavailable API produces visible feedback.
export function nativeAPI(name: string): any {
  const value = (globalThis as any)[name] ?? (sdk as any)[name]
  if (value == null) throw new UserError(`当前 Scripting 未提供 ${name} 接口，请更新 App 后重试。`)
  return value
}

const KEY = "activity-to-calendar.deepseek-key"
export function loadKey(): string {
  return nativeAPI("Keychain").get(KEY) || ""
}
export function rememberKey(key: string): void {
  if (nativeAPI("Keychain").set(KEY, key.trim(), {
    synchronizable: false, accessibility: "unlocked_this_device",
  }) !== true) throw new UserError("密钥未能保存到本机钥匙串，请检查系统授权后重试。")
}
export function forgetKey(): void {
  if (nativeAPI("Keychain").remove(KEY) !== true) throw new UserError("未能清除密钥，请重试。")
}

export function safeError(error: unknown, secret: string): string {
  if (error instanceof UserError) return error.message
  let text = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  if (secret) text = text.split(secret).join("[已隐藏]")
  return text.replace(/sk-[A-Za-z0-9_-]+/g, "[已隐藏]")
    .replace(/Bearer\s+\S+/gi, "Bearer [已隐藏]").slice(0, 180)
}
