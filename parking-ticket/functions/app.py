from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_csv('output.csv', encoding='cp949')

@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run()
