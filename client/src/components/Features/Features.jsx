import "./Features.css";

function Features(){

const features=[

"Career Assessment",

"Career Recommendation",

"Resume Builder",

"Resume Analyzer",

"Placement Readiness",

"Mock Interview"

];

return(

<section className="features">

<h2>

Our Features

</h2>

<div className="feature-grid">

{features.map((feature,index)=>(

<div key={index} className="card">

<h3>{feature}</h3>

<p>

Helping students prepare for successful careers.

</p>

</div>

))}

</div>

</section>

);

}

export default Features;