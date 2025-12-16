优先级规则

显示示例
状态	积分	优惠券	用户等级	显示内容
未充值	50（赠送）	3	0	优惠券图标 + 3 Free
未充值	0	3	0	优惠券图标 + 3 Free
未充值	50（赠送）	0	0	积分图标 + 50
已充值	100	0	1	积分图标 + 100
已充值	100	3	1	积分图标 + 100
已充值	0	0	1	积分图标 + 0
关键改进


与 isUpgradeMode 逻辑一致：userLevel 是判断是否充值的主要依据









修改后的弹窗规则
新的判断逻辑
// 弹窗规则：// 1. 只在当前会话中弹一次（useRef 记录，避免轮询多次弹出）// 2. 未充值用户（level === 0）且有优惠券（free_times > 0）时弹窗// 3. 即使有赠送的积分，未充值用户也应该弹窗提醒有优惠券可用if (hasFreeVouchers && userLevel === 0 && !hasShownVoucherRef.current) {  // 弹窗}
主要变化
移除了 !hasCredits 条件
未充值用户（userLevel === 0）只要有优惠券（free_times > 0）就会弹窗
即使有赠送的积分，也会弹窗提醒
显示示例
状态	积分	优惠券	用户等级	是否弹窗	说明
未充值	0	3	0	✅ 弹窗	符合条件
未充值	50（赠送）	3	0	✅ 弹窗	即使有赠送积分也弹窗
未充值	0	0	0	❌ 不弹	没有优惠券
已充值	0	3	1	❌ 不弹	已充值用户
已充值	100	3	1	❌ 不弹	已充值用户
与 AuthIslandVisible 的一致性
AuthIslandVisible：未充值用户优先显示优惠券（即使有赠送积分）
UserProvider 弹窗：未充值用户有优惠券时弹窗提醒（即使有赠送积分）
两者逻辑一致：userLevel === 0 是判断是否充值的主要依据。














现在：先判断试用条件，满足则 mode = 'trial'，否则再判断是否有积分
试用模式判定条件（已更新）
现在只需要同时满足：
freeTimes > 0（有优惠券）
isTrialEligible === true（符合试用条件）
resolution === '480p' || resolution === '720p'
duration > 0
duration <= 15
userLevel === 0（未充值用户）
不再需要：totalCredits === 0
显示效果对比
状态	积分	优惠券	音频时长	用户等级	修改前 mode	修改后 mode	显示
未充值	0	3	≤15s	0	'trial'	'trial'	Free
未充值	50（赠送）	3	≤15s	0	'credits'	'trial'	Free
未充值	0	0	≤15s	0	'locked'	'locked'	X Credits
未充值	50（赠送）	0	≤15s	0	'credits'	'credits'	X Credits
已充值	0	3	≤15s	1	'locked'	'locked'	X Credits
关键改进
未充值用户即使有赠送积分，只要满足试用条件，也会进入试用模式，显示 'Free'
与 AuthIslandVisible 的逻辑一致：未充值用户优先显示优惠券
优先级：试用模式 > 积分模式 > 锁定模式
修改完成，无 linter 错误。