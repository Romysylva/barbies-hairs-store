type ReviewProps = {
  author: string;
  rating: number;
  comment: string;
  date: string;
};

const Review = ({ author, rating, comment, date }: ReviewProps) => {
  return (
    <div className="p-4 bg-white shadow rounded space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-purple-600">{author}</h4>
        <span className="text-sm text-gray-400">
          {new Date(date).toDateString()}
        </span>
      </div>
      <div className="text-yellow-500">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
      <p className="text-sm text-gray-700">{comment}</p>
    </div>
  );
};

export default Review;

// usage

{
  /* <Review
  author="Promise"
  rating={4}
  comment="The wig is beautiful and soft!"
  date={new Date().toISOString()}
/> */
}
