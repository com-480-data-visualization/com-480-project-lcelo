import pandas as pd
from datetime import date, datetime


def main():
    """ Transforms the data from my csv to the standards csv """
    df = pd.read_csv("covid19_cases_switzerland.csv")
    df_fatalities = pd.read_csv("covid19_fatalities_switzerland.csv")
    df_template = pd.read_csv("template.csv")
    df_formatted = df_template[0:0]
    cantons = df_template["abbreviation_canton"].unique()
    df_template.index = pd.Index(df_template["abbreviation_canton"], name="index")

    # Columns
    # date,country,abbreviation_canton,name_canton,lat,long,hospitalized_with_symptoms,intensive_care,total_hospitalized,home_confinment,total_currently_positive_cases,new_positive_cases,recovered,deaths,total_positive_cases,tests_performed

    for i, row in df.iterrows():
        dt = datetime.fromisoformat(row["Date"])
        for canton in cantons:
            new_positive_cases = 0
            if i > 0:
                new_positive_cases = row[canton] - df.iloc[i - 1][canton]

            df_formatted = df_formatted.append(
                {
                    "date": dt.isoformat(),
                    "country": "Switzerland",
                    "abbreviation_canton": canton,
                    "name_canton": df_template.loc[canton]["name_canton"],
                    "lat": df_template.loc[canton]["lat"],
                    "long": df_template.loc[canton]["long"],
                    "total_currently_positive_cases": row[canton],
                    "new_positive_cases": new_positive_cases,
                    "deaths": df_fatalities.iloc[i][canton],
                },
                True,
            )

    df_formatted.to_csv("covid_19_cases_switzerland_standard_format.csv", index=False)


if __name__ == "__main__":
    main()
