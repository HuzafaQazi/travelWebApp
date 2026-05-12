import { FaStar, FaStarHalfAlt } from "react-icons/fa"; // Assuming you want to use Font Awesome stars

const goldColor = "#FFA432";

const StarRating = ({ rating }) => {
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} style={{ color: goldColor }} />);
    }

    // Add half star if applicable
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" style={{ color: goldColor }} />);
    }

    return stars;
  };

  return <div style={{ display: "flex" }}>{renderStars()}</div>;
};

export default StarRating;
