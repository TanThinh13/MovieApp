
import { supabase } from "../data/supbaseClient";

const TABLE_NAME = "metrics"; // Thay bằng tên bảng trong Supabase
export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        // Tìm kiếm movie theo searchTerm
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("searchTerm", query)
            .single(); // Lấy một bản ghi duy nhất

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        if (data) {
            // Nếu đã tồn tại, cập nhật count
            await supabase
                .from(TABLE_NAME)
                .update({ count: data.count + 1 })
                .eq("title", data.title);
        } else {
            // Nếu chưa tồn tại, thêm mới
            await supabase.from(TABLE_NAME).insert({
                searchTerm: query,
                movie_id: movie.id,
                title: movie.title,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error("Error updating search count:", error);
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("count", { ascending: false })
            .limit(5);

        if (error) throw error;

        return data as TrendingMovie[];
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return undefined;
    }
};
export const getSavedMovies = async (userId: string): Promise<Movie[] | undefined> => {
    try {
        if (!userId) {
            console.error("User ID is required");
            return undefined;
        }

        const { data, error } = await supabase
            .from("savedMovie")
            .select("*")
            .eq("user_id", userId);

        if (error) throw error;

        return data as Movie[];
    } catch (error) {
        console.error("Error fetching saved movies:", error);
        return undefined;
    }
};

export { supabase };

