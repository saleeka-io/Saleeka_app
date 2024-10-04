import bannedIngredientsData from '.././app/bannedIngredients.json';

interface BannedIngredient {
  name: string;
  casNumber: string;
  reason: string;
  severity: 'red' | 'yellow' | 'green';
}

export interface Rating {
  rating: string;
  color: string;
  fillPercentage: number;
  animation: any;
}

export class RatingService {
  static calculateRating(ingredients: string[]): Rating {
    const bannedIngredients: BannedIngredient[] = bannedIngredientsData.bannedIngredients
      .filter((ingredient) =>
        ingredients.some((prodIngredient) =>
          prodIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
        )
      )
      .map((ingredient) => ({
        ...ingredient,
        severity: ingredient.severity as 'red' | 'yellow' | 'green', // Cast the severity to the correct union type
      }));

    if (bannedIngredients.length === 0) {
      return { rating: 'Clean', color: '#4CAF50', fillPercentage: 100, animation: 'checkmarkAnimation' };
    }

    const severityCount = {
      red: bannedIngredients.filter((i) => i.severity === 'red').length,
      yellow: bannedIngredients.filter((i) => i.severity === 'yellow').length,
      green: bannedIngredients.filter((i) => i.severity === 'green').length,
    };

    if (severityCount.red > 0) {
      return { rating: 'Poor', color: '#D32F2F', fillPercentage: 25, animation: 'redXAnimation' };
    } else if (severityCount.yellow > 0) {
      return { rating: 'Fair', color: '#FFA000', fillPercentage: 50, animation: 'cautionAnimation' };
    } else {
      return { rating: 'Good', color: '#4CAF50', fillPercentage: 75, animation: 'checkmarkAnimation' };
    }
  }
}
