#### Middleware that sets boolean flag loading=true at the start of function(s) and loading=false at it's end
Removes the need to add "set({ loading:true\false })" manually every time you want to do an async operation


### Example using "loading" middleware

```jsx
import { create } from 'zustand'
import { loading } from 'zustand-loading-middleware';

const useBearStore = create(
  loading(
    (set) => ({
      loading: false,
      // setLoading: (value) => set({ loading: value }), <-- if you have "setLoading" it will be ignored by default (to not cause issues)
      bears: 0,
      fetchBears: async (forest) => {
        // commented code below will be automatically added by middleware, it wraps whole function in try-finally block
        // try {
        //   set({ loading: true })
        const response = await fetch(forest)
        set({ bears: await response.json() })
        //  commented code below will be automatically added by middleware
        // } finally {
        //   set({ loading: false })
        // note: it won't "catch" any errors as it doesn't inject "catch" block, only "finally"
        // }
      },
      removeAllBears: () => set({ bears: 0 }),
    }),
    // optional params that you can pass: "whitelist", "blacklist", "loadingVarName"
    {
      whitelist: ['fetchBears'], // if "whitelist" is specified "loading" will only be set to "true" for function in "whitelist" ("blacklist" will be ignored)
      blacklist: ['removeAllBears', 'setLoading'], // if "blacklist" is specified it won't apply "set({ loading: ... })" to functions in a blacklist. By default blacklist contains 'setLoading'
      // loadingVarName: 'isFetching' // by providing "loadingVarName" you can change default name for boolean flag that will get updated by middleware from "loading" (default) to "isFetching" (in this case)
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