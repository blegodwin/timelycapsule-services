import { Capsule, ICapsule } from '../model/capsule.model';
import { legendaryCriteria } from '../config/legendaryCriteria';

export const updateLegendaryStatus = async (): Promise<void> => {
  try {
    const now = new Date();
    // Find all capsules that are not marked legendary
    const capsules: any = await Capsule.find({ legendary: false });

    for (const capsule of capsules) {
      const yearsLocked =
        (now.getTime() - capsule.lockedAt.getTime()) /
        (1000 * 60 * 60 * 24 * 365);

      if (
        capsule.views >= legendaryCriteria.minViews &&
        yearsLocked >= legendaryCriteria.minYearsLocked
      ) {
        capsule.legendary = true;
        await capsule.save();
      }
    }
  } catch (error) {
    console.error('Error updating legendary status:', error);
  }
};
