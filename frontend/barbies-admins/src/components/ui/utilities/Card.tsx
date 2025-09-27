// components/ui/Card.tsx
type CardProps = {
  children: React.ReactNode;
};

const Card = ({ children }: CardProps) => (
  <div className="bhs:bg-white bhs:rounded-xl bhs:shadow-md bhs:p-4 bhs:space-y-2">
    {children}
  </div>
);

export default Card;

//usage

{
  /* <Card>
  <h3 className="bhs:text-lg bhs:font-bold">Wig Bundle</h3>
  <p>₦15,000</p>
</Card> */
}
