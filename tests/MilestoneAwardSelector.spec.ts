import {expect} from 'chai';
import {ARABIA_TERRA_AWARDS, ARES_AWARDS, ELYSIUM_AWARDS, HELLAS_AWARDS, MOON_AWARDS, ORIGINAL_AWARDS, VENUS_AWARDS} from '../src/server/awards/Awards';
import {IAward} from '../src/server/awards/IAward';
import {chooseMilestonesAndAwards, LIMITED_SYNERGY, maximumSynergy, verifySynergyRules} from '../src/server/MilestoneAwardSelector';
import {IMilestone} from '../src/server/milestones/IMilestone';
import {ARABIA_TERRA_MILESTONES, ARES_MILESTONES, ELYSIUM_MILESTONES, HELLAS_MILESTONES, MOON_MILESTONES, ORIGINAL_MILESTONES, VENUS_MILESTONES} from '../src/server/milestones/Milestones';
import {RandomMAOptionType} from '../src/common/ma/RandomMAOptionType';
import {testGameOptions} from './TestingUtils';
import {intersection} from '../src/common/utils/utils';

function toNames(list: Array<IMilestone | IAward>): Array<string> {
  return list.map((e) => e.name);
}

describe('MilestoneAwardSelector', () => {
  // These aren't particularly excellent tests as much as they help demonstrate
  // what the original maps, if selected in full, would have as a synergy.

  it('Tharsis milestones and awards have high synergy', () => {
    // Gardener / Landlord have synergy 6.
    expect(maximumSynergy(toNames([...ORIGINAL_MILESTONES, ...ORIGINAL_AWARDS]))).eq(6);
  });

  it('Elysium milestones and awards have high synergy', () => {
    // DesertSettler / Estate Dealer has synergy 5.
    expect(maximumSynergy(toNames([...ELYSIUM_MILESTONES, ...ELYSIUM_AWARDS]))).eq(5);
  });
  it('Hellas milestones and awards have high synergy', () => {
    // Both pairs Polar Explorer / Cultivator and Rim Settler / Space Baron
    // have synergy 3.
    expect(maximumSynergy(toNames([...HELLAS_MILESTONES, ...HELLAS_AWARDS]))).eq(3);
  });
  it('Venus milestones and awards have high synergy', () => {
    // Hoverlord / Venuphine have synergy 5.
    expect(maximumSynergy(toNames([...VENUS_MILESTONES, ...VENUS_AWARDS]))).eq(5);
  });

  it('Tharsis milestones and awards break limited synergy rules', () => {
    // Tharsis milestones and awards has total synergy of 21 and break the rules.
    expect(verifySynergyRules(
      toNames([...ORIGINAL_MILESTONES, ...ORIGINAL_AWARDS]),
      LIMITED_SYNERGY)).eq(false);
  });

  it('Elysium milestones and awards do not break limited synergy rules', () => {
    // Elysium milestones and awards has total synergy of 13 and two high pairs of 4 and 5.
    // This set does not break the rules.
    expect(verifySynergyRules(
      toNames([...ELYSIUM_MILESTONES, ...ELYSIUM_AWARDS]),
      LIMITED_SYNERGY)).eq(true);
  });

  it('Hellas milestones and awards do not break limited synergy rules', () => {
    // Hellas milestones and awards has total synergy of 11 and no high pair. It does not break the rules.
    expect(verifySynergyRules(
      toNames([...HELLAS_MILESTONES, ...HELLAS_AWARDS]),
      LIMITED_SYNERGY)).eq(true);
  });

  it('Hellas milestones and awards break stringent limited synergy rules', () => {
    // Hellas milestones and awards break rules if allowed no synergy whatsoever.
    expect(verifySynergyRules(
      toNames([...HELLAS_MILESTONES, ...HELLAS_AWARDS]),
      {
        highThreshold: 10,
        maxSynergyAllowed: 0,
        numberOfHighAllowed: 0,
        totalSynergyAllowed: 0,
      })).eq(false);
  });

  it('Main entrance point', () => {
    // These tests don't test results, they just make sure these calls don't fail.
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.NONE}));
  });
  it('Main entrance point - limited', () => {
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.LIMITED}));
  });
  it('Main entrance point - unlimited', () => {
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.UNLIMITED}));
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.NONE, moonExpansion: true}));
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.LIMITED, moonExpansion: true}));
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.UNLIMITED, moonExpansion: true}));
  });

  it('Main entrance point, Ares & Moon enabled', () => {
    // These tests don't test results, they just make sure these calls don't fail.
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.NONE, aresExtension: true, moonExpansion: true}));
  });
  it('Main entrance point, Ares & Moon enabled - limited', () => {
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.LIMITED, aresExtension: true, moonExpansion: true}));
  });
  it('Main entrance point, Ares & Moon enabled - unlimited', () => {
    chooseMilestonesAndAwards(
      testGameOptions({randomMA: RandomMAOptionType.UNLIMITED, aresExtension: true, moonExpansion: true}));
  });

  it('Do not select expansion milestones or awards when they are not selected', () => {
    const avoidedAwards = [...VENUS_AWARDS, ...ARES_AWARDS, ...MOON_AWARDS, ...ARABIA_TERRA_AWARDS].map((a) => a.name);
    const avoidedMilestones = [...VENUS_MILESTONES, ...ARES_MILESTONES, ...MOON_MILESTONES, ...ARABIA_TERRA_MILESTONES].map((m) => m.name);
    for (let idx = 0; idx < 10000; idx++) {
      const mas = chooseMilestonesAndAwards(
        testGameOptions({
          randomMA: RandomMAOptionType.LIMITED,
          venusNextExtension: false,
          aresExtension: false,
          moonExpansion: false,
        }));

      expect(intersection(mas.awards.map((award) => award.name), avoidedAwards)).is.empty;
      expect(intersection(mas.milestones.map((milestone) => milestone.name), avoidedMilestones)).is.empty;
    }
  });
});
