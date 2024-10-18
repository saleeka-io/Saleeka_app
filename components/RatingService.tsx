import bannedIngredientsData from '.././app/bannedIngredients.json';
// Import the Lottie animations
import checkmarkAnimation from '../assets/lottie/Checkmark.json';
import redXAnimation from '../assets/lottie/RedX.json';
import cautionAnimation from '../assets/lottie/Caution.json';

// Define the structure of a banned ingredient
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
  // Removed animation property from here
}

export class RatingService {
  static calculateRating(ingredients: string[]): Rating {
    console.log('RatingService called with ingredients:', ingredients); // Log the received ingredients

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

    console.log('Filtered banned ingredients:', bannedIngredients); // Log the filtered banned ingredients

    if (bannedIngredients.length === 0) {
      const cleanRating = { rating: 'Clean', color: '#4CAF50', fillPercentage: 100 };
      console.log('Output rating (Clean):', cleanRating); // Log the result if the product is clean
      return cleanRating;
    }

    const severityCount = {
      red: bannedIngredients.filter((i) => i.severity === 'red').length,
      yellow: bannedIngredients.filter((i) => i.severity === 'yellow').length,
      green: bannedIngredients.filter((i) => i.severity === 'green').length,
    };

    let resultRating: Rating;

    if (severityCount.red > 0) {
      resultRating = { rating: 'Poor', color: '#D32F2F', fillPercentage: 25 };
    } else if (severityCount.yellow > 0) {
      resultRating = { rating: 'Fair', color: '#FFA000', fillPercentage: 50 };
    } else {
      resultRating = { rating: 'Good', color: '#4CAF50', fillPercentage: 75 };
    }

    console.log('Output rating:', resultRating); // Log the final output rating
    return resultRating;
  }
}
