import { useUserInfo } from './UserProvider';
import { trialConfigs, TrialModelKey, TrialParamsMap } from '../trial-config';

export type TrialAccessMode = 'credits' | 'trial' | 'locked';

export interface TrialAccessResult<K extends TrialModelKey> {
  mode: TrialAccessMode;
  totalCredits: number;
  freeTimes: number;
  isTrialEligible: boolean;
  modelKey: K;
}

export function useTrialAccess<K extends TrialModelKey>(
  modelKey: K,
  params: TrialParamsMap[K]
): TrialAccessResult<K> {
  const { userInfo } = useUserInfo();

  const totalCredits = userInfo?.total_credits ?? 0;
  const freeTimes = userInfo?.free_times ?? 0;
  const userLevel = userInfo?.level ?? 0;

  const config = trialConfigs[modelKey];
  const isTrialEligible = config ? config.isTrialEligible(params as any) : false;

  let mode: TrialAccessMode = 'locked';

  // 试用模式：有优惠券 + 符合试用条件 + 未充值用户（即使有赠送积分也优先使用优惠券）
  if (freeTimes > 0 && isTrialEligible && userLevel == 0) {
    mode = 'trial';
  } else if (totalCredits > 0) {
    // User has credits; normal usage.
    mode = 'credits';
  } else {
    // No credits and no valid trial config.
    mode = 'locked';
  }

  return {
    mode,
    totalCredits,
    freeTimes,
    isTrialEligible,
    modelKey,
  };
}

