helm upgrade --install airflow apache-airflow/airflow --namespace airflow \
  --set images.airflow.repository=registry.digitalocean.com/silobuster/airflow \
  --set images.airflow.tag=latest \
  --set images.airflow.pullPolicy=Always \
  --set registry.secretName=silobuster \
  --set webserverSecretKeySecretName=airflow-webserver-secret