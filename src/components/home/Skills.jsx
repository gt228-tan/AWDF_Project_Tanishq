function Skills({ skillList }) {
return (
    <>
<p><br></br>My Skills are: </p>
<ul style={{ listStyleType: "none", padding: 0 }}>
{skillList.map((s) => <li key={s}>{s}</li>)}
</ul>
</>
);
}
export default Skills;