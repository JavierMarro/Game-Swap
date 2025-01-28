import { Loader, Search } from "lucide-react";
import { Input } from "./ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useRef, useState } from "react";
import { getGamesBySearch, Game } from "../rawgApi";
import { Link } from "react-router";

const Searchbar: React.FC = () => {
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchValue, 750);

  useEffect(() => {
    const fetchGames = async () => {
      if (!debouncedSearch) {
        setFilteredGames([]); // Clear results if search input is empty
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const games = await getGamesBySearch(debouncedSearch);
        setFilteredGames(games);
        setIsDropdownVisible(true); // Show dropdown when results are available
      } catch (err) {
        setError("Couldn't fetch games.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleGameClick = () => {
    setIsDropdownVisible(false); // Close dropdown on game selection
    setSearchValue(""); // Optional: Clear search value
  };

  return (
    <form className="relative">
      {isLoading ? (
        <Loader
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
      ) : (
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          size={18}
        />
      )}
      <Input
        className="w-full pl-10 pr-4"
        type="search"
        placeholder="Search games..."
        value={searchValue}
        onChange={handleSearch}
      />
      {error && (
        <p className="text-red-500 absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {error}
        </p>
      )}
      {isDropdownVisible && !isLoading && !error && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredGames.length > 0 ? (
            <div>
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  to={`/game/${game.slug}`}
                  onClick={handleGameClick}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer dark:bg-stone-950"
                >
                  <div className="flex">
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <p className="ml-2">{game.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-4 text-gray-500">No games found.</p>
          )}
        </div>
      )}
    </form>
  );
};

export default Searchbar;
