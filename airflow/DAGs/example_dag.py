from airflow.decorators import task, dag
from datetime import datetime
from airflow.operators.empty import EmptyOperator
from airflow.kubernetes.secret import Secret

@dag(
  start_date=datetime(2022,8,1),
  schedule_interval='0 12 * * *',
  catchup=False
)

def example_dag():
    empty1 = EmptyOperator(task_id="empty_1")
    empty2 = EmptyOperator(task_id="empty_2")

    empty1 >> empty2

dag = example_dag()


