# Dataset

Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.

Hint: some good pointers for finding quality publicly available datasets (Google dataset search, Kaggle, OpenSwissData, SNAP and FiveThirtyEight)


One big issue with choosing this subject is that we have only limited data: the virus started to spread officially from December 2020, and most of the dataset on the internet contains data from mid-january only.

Our first dataset:
- Novel Corona Virus 2019 Dataset : https://www.kaggle.com/sudalairajkumar/novel-corona-virus-2019-dataset

This dataset contains data for 171 countries. We have data for deaths/confirmed/recovered cases from 22th January 2020 to 22th March 2020 for now.

Looking closer to the data (COVID19_open_line_list.csv), we have lots of NaN for symptoms, sex, chronic disease,...

COVID19_line_list_data.csv contains data about patients but only 1'085 rows on this file.

---
API for countries: https://rapidapi.com/collection/coronavirus-covid-19

API (35$ a month or web scraping?):  https://www.worldometers.info/coronavirus/



# Problematic

Covid-19, SARS-Cov-2, Coronavirus are probably the most used words for the last few months and will be the hot topic for this beginning of 2020.
This new virus was discovered in Wuhan (China) late 2019. It belongs to the coronavirus family and gives Covid-19 disease to humans. This disease symptoms are mainly : cough, cold, headache, fever, pneunomia, etc. Being very virulent and extremmely contagious, it's rapidly spreading and lead to thousands of deaths since hospitals are not able to provide respiratory support for needy patients. Since it's unknown to any human's immunity system, people want to contain the spreading in order to avoid deaths due to the lack of hospital equipments.

The aim of this course is to learn to design. But we also want to design to learn from the data we're studying. We're all concerned by this virus Sars-Cov-2, and we are taking this opportunity to learn more about the impact of this virus on our world.

Our ambition is to implement a platform where you can observe the virus spread in the world over time. Not only providing numbers, our goal is to use interactive data visualization techniques to allow user to "feel" the data.

By "feel", we mean:
- raise consciousness about the virus, its dangerousity (symptoms/risk factors), prevention
- present facts about the number of deaths or recovered/confirmed patients across the world
- allow user to compare data between countries and establish his own opinion


To sum up, we want to provide a data story that will lead to awareness, understanding and acceptance with only facts.
We are targetting people that want to see the evolution of this pandemic but also people that are not following safety measure. Indeed, we hope our data story will help them change their behaviours in order to reduce the spread of the virus for the sake of hospital systems across the world.


# Exploratory Data Analysis

Pre-processing of the data set you chose:

- identify and remove vectors full of NaN
- for symptoms: some rows contains several symptoms together, we need to melt the data in order to use this

- we have summary for 1086 patients (text) that we want to (graphes de similitude? graphe avec les mots?)

TODO

Show some basic statistics and get insights about the data:

TODO

# Related work

What others have already done with the data?
- https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
TODO

Why is your approach original?
By combining measured **facts** with an **interactive** platform, we're being original. Indeed, it amplifies the cognition with the data and lots of the websites provide only counters and graphs for now which don't allow to dive into the data.


What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
- http://bl.ocks.org/KoGor/5994804
- https://www.worldometers.info/coronavirus/coronavirus-cases/
TODO
