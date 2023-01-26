import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import Card from 'react-bootstrap/Card';
import OrdersList from './components/OrdersList';
import ToastHolder from './components/ToastHolder';
import useHttp from './hooks/http.hook';
import * as actions from "./store/actions";
import config from './config/default';
import { parseQuery } from './utils';

function App() {
  const { isLoading, request, error } = useHttp();
  const dispatch = useDispatch();
  const transport = useSelector((state) => state.transport);
  const loading = useSelector((state) => state.loading);

  const { id } = parseQuery(window.location.search);

  const fetchLoadingData = useCallback(async () => {
    try {
      const fetched = await request(`${config.app.orderApiUrl}/app/web/api/loadings/${id}?expand=orders,transport`);
      console.log(fetched)
      const { creation_date: creationDate, is_loaded: isLoaded } = fetched;
      dispatch(actions.onLoadingFetched({ ...fetched, creationDate, isLoaded }));
    } catch (e) {}
  }, [request, dispatch, id]);

  useEffect(() => {
    fetchLoadingData();
  }, [fetchLoadingData]);

  useEffect(() => {
    if (error) {
      dispatch(actions.addError('Произошла ошибка при выполнении запроса. ', error));
      console.error(error);
    }
  }, [dispatch, error]);

  if (!id) {
    return 'Не указан план загрузки';
  }

  if (error) {
    return 'Невозможно загрузить страницу'
  }

  if (isLoading) {
    return 'Загрузка';
  }

  return (
    <>
      <ToastHolder />
      <Card>
        <Card.Header>
          <h3>Погрузка транспорта №{loading.id} от {loading.creationDate}</h3>
          <h4>Автомобиль: {transport.name} - {transport.state_number}</h4>
          <div>{transport.volume}</div>
        </Card.Header>
        <OrdersList />
      </Card>
    </>
  );
}

export default App;
