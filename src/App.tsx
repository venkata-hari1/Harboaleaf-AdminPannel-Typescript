import React, { Suspense } from 'react';
const AppRoute = React.lazy(
  () => import("./Routes/Routes")
);
const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppRoute />
    </Suspense>
  );
};

export default App;
