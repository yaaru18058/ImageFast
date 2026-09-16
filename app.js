const { createApp, ref, computed, onMounted, watch } = Vue;

createApp({
    setup() {
        const BASE_DOMAIN = "https://yaaru18058.github.io/QuickImagesCatalog/";
        
        const categoryNameMap = {
            "nature": "Природа",
            "anime": "Аниме",
            "cyberpunk": "Киберпанк",
            "minimalist": "Минимализм",
            "space": "Космос",
            "cars": "Автомобили",
            "cityscape": "Городской пейзаж",
            "dark": "Темные",
            "fantasy": "Фэнтези",
            "abstract": "Абстракция",
            "gaming": "Игры",
            "mountains": "Горы",
            "ocean": "Океан",
            "animals": "Животные",
            "architecture": "Архитектура",
            "retro": "Ретро",
            "sci-fi": "Научная фантастика",
            "sunset": "Закат",
            "neon": "Неон",
            "pixel art": "Пиксель-арт",
            "imported": "Популярные"
        };

        const allWallpapers = ref([]);
        const categoryList = ref([]);
        const selectedOrientation = ref(null);
        const selectedQuery = ref(null);
        const selectedImageIndex = ref(null);
        const isLoading = ref(true);
        const errorMessage = ref(null);

        const multiplier = 1000;
        const totalCount = computed(() => categoryList.value.length > 0 ? categoryList.value.length * multiplier : 0);

        const updateCategoriesPreview = (orientation) => {
            if (allWallpapers.value.length === 0 || categoryList.value.length === 0) return;
            categoryList.value = categoryList.value.map(cat => {
                const found = allWallpapers.value.find(item => {
                    const matchesCat = item.category?.toLowerCase() === cat.query.toLowerCase();
                    const matchesOrient = orientation === null || item.orientation?.toLowerCase() === orientation.toLowerCase();
                    return matchesCat && matchesOrient;
                }) || allWallpapers.value.find(item => item.category?.toLowerCase() === cat.query.toLowerCase());

                const pathForPreview = found?.thumbPath || found?.path || "";
                const previewPath = pathForPreview ? BASE_DOMAIN + pathForPreview : "";
                return { ...cat, previewUrl: previewPath };
            });
        };

        const fetchCatalog = async () => {
            try {
                const response = await fetch(BASE_DOMAIN + "catalog.json");
                if (!response.ok) throw new Error("Не удалось загрузить каталог");
                const wallpapersArray = await response.json();
                allWallpapers.value = wallpapersArray;

                const uniqueQueries = [...new Set(wallpapersArray.map(item => item.category).filter(Boolean))];
                categoryList.value = uniqueQueries.map(catQuery => {
                    const title = categoryNameMap[catQuery.toLowerCase()] || catQuery;
                    const found = wallpapersArray.find(item => item.category?.toLowerCase() === catQuery.toLowerCase());
                    const pathForPreview = found?.thumbPath || found?.path || "";
                    const previewPath = pathForPreview ? BASE_DOMAIN + pathForPreview : "";
                    return { title, query: catQuery, previewUrl: previewPath };
                });

                isLoading.value = false;
                updateCategoriesPreview(selectedOrientation.value);
            } catch (e) {
                console.error(e);
                errorMessage.value = "Не удалось загрузить каталог с GitHub. Проверьте соединение.";
                isLoading.value = false;
            }
        };

        watch(selectedOrientation, (newOrientation) => {
            updateCategoriesPreview(newOrientation);
        });

        const getCategory = (index) => {
            const list = categoryList.value;
            return list[(index - 1) % list.length];
        };

        const wallPaperList = computed(() => {
            const query = selectedQuery.value;
            if (!query) return [];
            return allWallpapers.value.filter(item => {
                const matchesCategory = item.category?.toLowerCase() === query.toLowerCase();
                const matchesOrientation = selectedOrientation.value === null || item.orientation?.toLowerCase() === selectedOrientation.value.toLowerCase();
                return matchesCategory && matchesOrientation;
            });
        });

        const selectCategory = (query) => {
            selectedQuery.value = query;
            selectedImageIndex.value = null;
        };

        const getCurrentImageUrl = () => {
            if (selectedImageIndex.value === null || wallPaperList.value.length === 0) return "";
            const wp = wallPaperList.value[selectedImageIndex.value];
            return wp && wp.path ? BASE_DOMAIN + wp.path : "";
        };

        const handleImageError = (e) => {
            e.target.src = "https://via.placeholder.com/280x180?text=No+Image";
        };

        onMounted(() => {
            fetchCatalog();
        });

        return {
            BASE_DOMAIN, categoryList, selectedOrientation, selectedQuery, selectedImageIndex,
            isLoading, errorMessage, totalCount, wallPaperList,
            getCategory, selectCategory, getCurrentImageUrl, handleImageError
        };
    }
}).mount('#app');