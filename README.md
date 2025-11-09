#### Middleware adds set({ loading: true }) at the start of function(s) and set({ loading: false }) at the end (which removes the need to add those lines every time you do an async operation)


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
        // code below will be automatically added by middleware (wraps whole function in try-finally block)
        // try {
        //   set({ loading: true })
        const response = await fetch(forest)
        set({ bears: await response.json() })
        //  code below will be automatically added by middleware
        // } finally {
        //   set({ loading: false })
        // }
      },
      removeAllBears: () => set({ bears: 0 }),
    }),
    // optional params that include "whitelist", "blacklist"
    {
      whitelist: ['fetchBears'], // if specified "loading" will only be set to true inside those function-names (blacklist will be ignored)
      blacklist: ['removeAllBears', 'setLoading'], // if specified it won't apply set({ loading: ... }) to functions in a list. By default blacklist contains 'setLoading'
    },
    )
)
```

### Example usage
```jsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  const loading = useBearStore((state) => state.loading)

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