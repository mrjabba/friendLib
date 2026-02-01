export default function MenuSidebar({ onSelectAdd, onSelectHome }) {
  //console.log(`>> MenuSidebar start`);
  // function handleOnClick() {
  //   console.log(`add button clicked`);
  // }

  return (
    <>
      <ul className="my-5 px-8 md:text-xl">
        <li>
          <button className="py-2" onClick={onSelectHome}>Home</button>
        </li>
        <li>
          <button className="py-2" onClick={onSelectAdd}>Add</button>
        </li>
      </ul>
    </>
  );
}
