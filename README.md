#### Middleware sets boolean flag loading=true at the start of function(s) and loading=false at it's end
This removes the need to add those lines manually every time you do an async operation


### Example using "loading" middleware

```jsx
import { create } from 'zustand'
import { loading } from 'zustand-loading-middleware';

const useBearStore = create(
  loading(
    (set) => ({
      loading: false,
      setLoading: (value) => set({ loading: value }),
      bears: 0,
      fetchBears: async (forest) => {
        // commented code below will be automatically added by middleware (it wraps whole function in try-finally block)
        // try {
        //   set({ loading: true })
        const response = await fetch(forest)
        set({ bears: await response.json() })
        //  commented code below will be automatically added by middleware
        // } finally {
        //   set({ loading: false })
        // }
      },
      removeAllBears: () => set({ bears: 0 }),
    }),
    // optional params that include "whitelist", "blacklist", "loadingVarName"
    {
      whitelist: ['fetchBears'], // if specified "loading" will only be set to true inside those function-names (blacklist will be ignored)
      blacklist: ['removeAllBears', 'setLoading'], // if specified it won't apply set({ loading: ... }) to functions in a list. By default blacklist contains 'setLoading'
      // loadingVarName: 'isFetching' // here you can change default name for boolean flag that will get updated by middleware from 'loading' (default) to 'isFetching' (in this case)
    },
    )
)
```

### Example usage inside component
```jsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const fetchBears = useBearStore((state) => state.fetchBears);
  const loading = useBearStore((state) => state.loading);

  useEffect(() => {
    fetchBears();
  }, []);

  return (
    <View>
      {loading ? (
        <ActivityIndicator animating={loading} />
      ) : (
        <Text>Amount of bears: {bears?.length}</Text>
      )}
    </View>
  );
}
```