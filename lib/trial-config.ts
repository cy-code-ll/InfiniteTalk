// Central trial configuration for InfiniteTalk.
// Defines when a given parameter set is eligible for free trial usage.

export type TrialModelKey = 'infinitetalk';

export interface InfiniteTalkTrialParams {
  resolution: string;
  duration: number; // Audio duration in seconds (ceil)
}

export type TrialParamsMap = {
  infinitetalk: InfiniteTalkTrialParams;
};

type TrialConfig<P> = {
  isTrialEligible: (params: P) => boolean;
};

export const trialConfigs: {
  [K in TrialModelKey]: TrialConfig<TrialParamsMap[K]>;
} = {
  infinitetalk: {
    // InfiniteTalk: 480p or 720p resolution, and audio length <= 15s
    isTrialEligible: (params: InfiniteTalkTrialParams) =>
      (params.resolution === '480p' || params.resolution === '720p') &&
      params.duration > 0 &&
      params.duration <= 15,
  },
};

