interface InfoCardProps {
  title: string;
  description: string;
  iconUrl: string;
}

const InfoCard = ({ title, description, iconUrl }: InfoCardProps) => {
  return (
    <div className="server-info-card">
      <div className="card-icon">
        <img src={iconUrl} alt={title} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default InfoCard;