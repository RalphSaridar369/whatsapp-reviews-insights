const HomeCard = ({title, subtitle, subtitleColor}:{title:string, subtitle:string, subtitleColor?:string}) => {
  return (
    <div className="bg-cd-background flex-1 py-2 px-3 border flex flex-col">
      <p className="text-gray">{title}</p>
      <h2 className={subtitleColor ?? "text-text"}>{subtitle}</h2>
    </div>
  );
};

export default HomeCard;
