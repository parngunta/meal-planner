import { SVGProps } from 'react'

// Food on Dish Icon
export const FoodOnDishIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Dish/Plate */}
    <ellipse cx="50" cy="55" rx="35" ry="15" stroke="none" />
    <ellipse cx="50" cy="55" rx="35" ry="15" />
    
    {/* Fork */}
    <path d="M 15 45 L 25 45" />
    <path d="M 25 45 L 25 35" />
    <line x1="25" y1="30" x2="20" y2="25" />
    <line x1="30" y1="30" x2="25" y2="25" />
    <line x1="35" y1="30" x2="30" y2="25" />
    
    {/* Spoon */}
    <path d="M 85 45 L 75 45" />
    <path d="M 75 45 L 75 35" />
    <path d="M 75 30 Q 70 35 65 35" />
    <path d="M 65 35 Q 65 45 75 45" />
    
    {/* Food (simple representation) */}
    <path d="M 35 55 L 35 65 M 65 55 L 65 65 M 50 55 L 50 65" />
    <circle cx="50" cy="60" r="5" />
  </svg>
)
