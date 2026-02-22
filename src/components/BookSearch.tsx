export default function BookSearch() {
    function handleSearch() {
        console.log('search!');
    }

   return (
    <>
<h2 className="text-xl font-semibold mb-4">Book Search</h2>

<fieldset className="border border-gray-300 rounded-md p-4 mb-6">
  <legend className="font-medium px-1"> Details</legend>

  <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center">
    <label htmlFor="title" className="md:w-40 font-medium">Search</label>
    <input
      type="text"
      id="search"
      name="search"
      required
      className="border border-gray-300 rounded px-3 py-2 flex-1"
    />
  </div>

</fieldset>

<button
  type="submit"
  onClick={() => handleSearch()}
  className="bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition"
>
  Search
</button>


    </>
   ) 
}