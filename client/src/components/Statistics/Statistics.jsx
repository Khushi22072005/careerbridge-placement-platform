import "./Statistics.css";

function Statistics() {
  const stats = [
    {
      number: "10K+",
      title: "Students"
    },
    {
      number: "300+",
      title: "Companies"
    },
    {
      number: "120+",
      title: "Mentors"
    },
    {
      number: "95%",
      title: "Placement Ready"
    }
  ];

  return (
    <section className="statistics">

      <h2>CareerBridge In Numbers</h2>

      <div className="statistics-container">

        {stats.map((item,index)=>(
          <div className="stat-card" key={index}>
            <h1>{item.number}</h1>
            <p>{item.title}</p>
          </div>
        ))}

      </div>

    </section>
  );
}

export default Statistics;